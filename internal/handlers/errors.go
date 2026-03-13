package handlers

import (
	"errors"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"gorm.io/gorm"
)

// ErrPetNotAvailable é retornado quando um pet não está com status "Disponível".
var ErrPetNotAvailable = errors.New("pet não está disponível para adoção")

// apiError é o envelope padrão de erro da API.
type apiError struct {
	Code    int              `json:"-"`
	Message string           `json:"error"`
	Fields  []fieldError     `json:"campos,omitempty"`
}

type fieldError struct {
	Field   string `json:"campo"`
	Message string `json:"mensagem"`
}

// respondError envia a resposta de erro formatada.
func respondError(c *gin.Context, err apiError) {
	c.AbortWithStatusJSON(err.Code, err)
}

// bindError converte erros de validação do Gin/validator em mensagens legíveis.
func bindError(err error) apiError {
	var ve validator.ValidationErrors
	if !errors.As(err, &ve) {
		return apiError{Code: http.StatusBadRequest, Message: err.Error()}
	}

	fields := make([]fieldError, 0, len(ve))
	for _, fe := range ve {
		fields = append(fields, fieldError{
			Field:   strings.ToLower(fe.Field()),
			Message: validationMessage(fe),
		})
	}

	return apiError{
		Code:    http.StatusBadRequest,
		Message: "dados inválidos na requisição",
		Fields:  fields,
	}
}

// dbError classifica erros do GORM e retorna o apiError adequado.
func dbError(err error, notFoundMsg string) apiError {
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return apiError{Code: http.StatusNotFound, Message: notFoundMsg}
	}
	return apiError{Code: http.StatusInternalServerError, Message: "erro interno no servidor"}
}

// validationMessage traduz tags do validator para português.
func validationMessage(fe validator.FieldError) string {
	switch fe.Tag() {
	case "required":
		return "campo obrigatório"
	case "email":
		return "e-mail inválido"
	case "oneof":
		return "valor inválido; opções permitidas: " + strings.ReplaceAll(fe.Param(), " ", ", ")
	case "gte":
		return "deve ser maior ou igual a " + fe.Param()
	case "gt":
		return "deve ser maior que " + fe.Param()
	case "min":
		return "tamanho mínimo de " + fe.Param() + " caracteres"
	case "max":
		return "tamanho máximo de " + fe.Param() + " caracteres"
	default:
		return "valor inválido"
	}
}
