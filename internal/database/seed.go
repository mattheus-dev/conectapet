package database

import (
	"log"
	"os"

	"conectapet/internal/models"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

// SeedAdmin cria o usuário administrador padrão caso ainda não exista nenhum usuário.
// Credenciais configuráveis via variáveis de ambiente:
//
//	ADMIN_USERNAME (padrão: "admin")
//	ADMIN_PASSWORD (padrão: "admin123")
func SeedAdmin(db *gorm.DB) error {
	var count int64
	db.Model(&models.User{}).Count(&count)
	if count > 0 {
		return nil
	}

	username := os.Getenv("ADMIN_USERNAME")
	if username == "" {
		username = "admin"
	}

	password := os.Getenv("ADMIN_PASSWORD")
	if password == "" {
		password = "admin123"
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	admin := models.User{
		Username: username,
		Password: string(hash),
		Role:     "admin",
	}

	if err := db.Create(&admin).Error; err != nil {
		return err
	}

	log.Printf("Usuário admin criado — login: %s | Altere a senha em produção!", username)
	return nil
}
