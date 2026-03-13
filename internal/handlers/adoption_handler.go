package handlers

import (
	"net/http"

	"conectapet/internal/models"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type AdoptionHandler struct {
	db *gorm.DB
}

func NewAdoptionHandler(db *gorm.DB) *AdoptionHandler {
	return &AdoptionHandler{db: db}
}

// Adopt godoc
// POST /api/adopt
// Recebe os dados do adotante e cria um formulário de adoção vinculado a um Pet.
// Valida se o pet existe e se está com status "Disponível" antes de registrar.
// Toda a operação é envolvida em uma transação de banco de dados.
func (h *AdoptionHandler) Adopt(c *gin.Context) {
	var req models.CreateAdoptionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		respondError(c, bindError(err))
		return
	}

	var adoption models.Adoption

	txErr := h.db.Transaction(func(tx *gorm.DB) error {
		var pet models.Pet
		if err := tx.First(&pet, req.PetID).Error; err != nil {
			return err
		}

		if pet.Status != models.PetStatusAvailable {
			return ErrPetNotAvailable
		}

		adoption = models.Adoption{
			PetID:          req.PetID,
			AdopterName:    req.AdopterName,
			Email:          req.Email,
			Phone:          req.Phone,
			AdoptionReason: req.AdoptionReason,
			Status:         models.AdoptionStatusPending,
		}

		return tx.Create(&adoption).Error
	})

	if txErr != nil {
		switch txErr {
		case gorm.ErrRecordNotFound:
			respondError(c, apiError{
				Code:    http.StatusNotFound,
				Message: "pet não encontrado com o id informado",
			})
		case ErrPetNotAvailable:
			respondError(c, apiError{
				Code:    http.StatusConflict,
				Message: "este pet não está disponível para adoção",
			})
		default:
			respondError(c, apiError{
				Code:    http.StatusInternalServerError,
				Message: "erro ao registrar a solicitação de adoção",
			})
		}
		return
	}

	// Carrega o Pet relacionado para retornar na resposta
	h.db.Preload("Pet").First(&adoption, adoption.ID)

	c.JSON(http.StatusCreated, adoption)
}

// ListAdoptions godoc
// GET /api/adoptions
// Retorna todas as solicitações de adoção com os dados do pet vinculado.
// Query param opcional: ?status=Pendente|Aprovado|Rejeitado
func (h *AdoptionHandler) ListAdoptions(c *gin.Context) {
	var adoptions []models.Adoption

	query := h.db.Preload("Pet")

	if status := c.Query("status"); status != "" {
		query = query.Where("status = ?", status)
	}

	if err := query.Find(&adoptions).Error; err != nil {
		respondError(c, apiError{
			Code:    http.StatusInternalServerError,
			Message: "erro ao buscar solicitações de adoção",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":  adoptions,
		"total": len(adoptions),
	})
}

// GetAdoption godoc
// GET /api/adoptions/:id
// Retorna uma solicitação de adoção pelo ID.
func (h *AdoptionHandler) GetAdoption(c *gin.Context) {
	id := c.Param("id")

	var adoption models.Adoption
	if err := h.db.Preload("Pet").First(&adoption, id).Error; err != nil {
		respondError(c, dbError(err, "solicitação de adoção não encontrada"))
		return
	}

	c.JSON(http.StatusOK, adoption)
}

// UpdateAdoptionStatus godoc
// PATCH /api/adoptions/:id/status
// Atualiza o status de uma adoção (Pendente | Aprovado | Rejeitado).
// Ao Aprovar, o pet vinculado é automaticamente marcado como "Adotado".
func (h *AdoptionHandler) UpdateAdoptionStatus(c *gin.Context) {
	id := c.Param("id")

	var req models.UpdateAdoptionStatusRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		respondError(c, bindError(err))
		return
	}

	var adoption models.Adoption

	txErr := h.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.First(&adoption, id).Error; err != nil {
			return err
		}

		if err := tx.Model(&adoption).Update("status", req.Status).Error; err != nil {
			return err
		}

		if req.Status == models.AdoptionStatusApproved {
			return tx.Model(&models.Pet{}).
				Where("id = ?", adoption.PetID).
				Update("status", models.PetStatusAdopted).Error
		}

		return nil
	})

	if txErr != nil {
		respondError(c, dbError(txErr, "solicitação de adoção não encontrada"))
		return
	}

	h.db.Preload("Pet").First(&adoption, adoption.ID)

	c.JSON(http.StatusOK, adoption)
}
