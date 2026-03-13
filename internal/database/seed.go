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

	var user models.User
	result := db.Where("username = ?", username).First(&user)

	if result.Error != nil {
		// Usuário não existe, criar
		admin := models.User{
			Username: username,
			Password: string(hash),
			Role:     "admin",
		}
		if err := db.Create(&admin).Error; err != nil {
			return err
		}
		log.Printf("Usuário admin criado — login: %s", username)
	} else {
		// Usuário existe, atualizar senha
		if err := db.Model(&user).Update("password", string(hash)).Error; err != nil {
			return err
		}
		log.Printf("Senha do usuário admin atualizada — login: %s", username)
	}

	return nil
}
