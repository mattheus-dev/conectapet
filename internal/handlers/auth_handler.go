package handlers

import (
	"net/http"
	"os"
	"time"

	"conectapet/internal/models"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type AuthHandler struct {
	db *gorm.DB
}

func NewAuthHandler(db *gorm.DB) *AuthHandler {
	return &AuthHandler{db: db}
}

// Login godoc
// POST /api/auth/login
// Autentica o usuário e retorna um token JWT válido por 24 horas.
func (h *AuthHandler) Login(c *gin.Context) {
	var req models.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		respondError(c, bindError(err))
		return
	}

	var user models.User
	if err := h.db.Where("username = ?", req.Username).First(&user).Error; err != nil {
		// Retorna a mesma mensagem para não vazar se o usuário existe ou não
		respondError(c, apiError{Code: http.StatusUnauthorized, Message: "usuário ou senha inválidos"})
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
		respondError(c, apiError{Code: http.StatusUnauthorized, Message: "usuário ou senha inválidos"})
		return
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"sub": user.ID,
		"usr": user.Username,
		"rol": user.Role,
		"exp": time.Now().Add(24 * time.Hour).Unix(),
		"iat": time.Now().Unix(),
	})

	tokenStr, err := token.SignedString(jwtSecret())
	if err != nil {
		respondError(c, apiError{Code: http.StatusInternalServerError, Message: "erro ao gerar token de acesso"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"token": tokenStr,
		"user": gin.H{
			"id":       user.ID,
			"username": user.Username,
			"role":     user.Role,
		},
	})
}

// jwtSecret retorna a chave secreta do JWT a partir da variável de ambiente.
func jwtSecret() []byte {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		secret = "conectapet-dev-secret-troque-em-producao"
	}
	return []byte(secret)
}
