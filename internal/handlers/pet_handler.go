package handlers

import (
	"net/http"

	"conectapet/internal/models"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type PetHandler struct {
	db *gorm.DB
}

func NewPetHandler(db *gorm.DB) *PetHandler {
	return &PetHandler{db: db}
}

// ListAvailablePets godoc
// GET /api/pets
// Retorna todos os pets com status "Disponível".
// Query params opcionais: ?especie=Cachorro|Gato|Outro
func (h *PetHandler) ListAvailablePets(c *gin.Context) {
	var pets []models.Pet

	query := h.db.Where("status = ?", models.PetStatusAvailable)

	if especie := c.Query("especie"); especie != "" {
		query = query.Where("species = ?", especie)
	}

	if err := query.Find(&pets).Error; err != nil {
		respondError(c, apiError{
			Code:    http.StatusInternalServerError,
			Message: "erro ao buscar pets disponíveis",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":  pets,
		"total": len(pets),
	})
}

// ListAllPets godoc
// GET /api/admin/pets
// Retorna TODOS os pets sem filtro de status. Uso exclusivo do painel admin.
func (h *PetHandler) ListAllPets(c *gin.Context) {
	var pets []models.Pet

	query := h.db.Model(&models.Pet{})

	if especie := c.Query("especie"); especie != "" {
		query = query.Where("species = ?", especie)
	}

	if err := query.Order("created_at desc").Find(&pets).Error; err != nil {
		respondError(c, apiError{
			Code:    http.StatusInternalServerError,
			Message: "erro ao buscar pets",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":  pets,
		"total": len(pets),
	})
}

// CreatePet godoc
// POST /api/pets
// Cadastra um novo pet. Campos obrigatórios: nome, especie.
func (h *PetHandler) CreatePet(c *gin.Context) {
	var req models.CreatePetRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		respondError(c, bindError(err))
		return
	}

	pet := models.Pet{
		Name:        req.Name,
		Species:     req.Species,
		Age:         req.Age,
		Description: req.Description,
		ImageURL:    req.ImageURL,
		Status:      models.PetStatusAvailable,
	}

	if err := h.db.Create(&pet).Error; err != nil {
		respondError(c, apiError{
			Code:    http.StatusInternalServerError,
			Message: "erro ao salvar o pet no banco de dados",
		})
		return
	}

	c.JSON(http.StatusCreated, pet)
}

// GetPet godoc
// GET /api/pets/:id
// Retorna um pet pelo ID.
func (h *PetHandler) GetPet(c *gin.Context) {
	id := c.Param("id")

	var pet models.Pet
	if err := h.db.First(&pet, id).Error; err != nil {
		respondError(c, dbError(err, "pet não encontrado"))
		return
	}

	c.JSON(http.StatusOK, pet)
}

// UpdatePetStatus godoc
// PATCH /api/pets/:id/status
// Atualiza o status de um pet (Disponível | Adotado).
func (h *PetHandler) UpdatePetStatus(c *gin.Context) {
	id := c.Param("id")

	var req models.UpdatePetStatusRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		respondError(c, bindError(err))
		return
	}

	var pet models.Pet
	if err := h.db.First(&pet, id).Error; err != nil {
		respondError(c, dbError(err, "pet não encontrado"))
		return
	}

	if err := h.db.Model(&pet).Update("status", req.Status).Error; err != nil {
		respondError(c, apiError{
			Code:    http.StatusInternalServerError,
			Message: "erro ao atualizar o status do pet",
		})
		return
	}

	c.JSON(http.StatusOK, pet)
}

// DeletePet godoc
// DELETE /api/pets/:id
// Remove um pet do sistema via soft delete (campo deleted_at).
func (h *PetHandler) DeletePet(c *gin.Context) {
	id := c.Param("id")

	var pet models.Pet
	if err := h.db.First(&pet, id).Error; err != nil {
		respondError(c, dbError(err, "pet não encontrado"))
		return
	}

	if err := h.db.Delete(&pet).Error; err != nil {
		respondError(c, apiError{
			Code:    http.StatusInternalServerError,
			Message: "erro ao remover o pet",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "pet removido com sucesso"})
}
