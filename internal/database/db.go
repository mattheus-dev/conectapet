package database

import (
	"fmt"
	"log"

	"conectapet/internal/models"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

func Connect(dsn string) (*gorm.DB, error) {
	db, err := gorm.Open(sqlite.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})
	if err != nil {
		return nil, fmt.Errorf("falha ao conectar ao banco de dados: %w", err)
	}

	return db, nil
}

func Migrate(db *gorm.DB) error {
	log.Println("Executando AutoMigrate...")

	if err := db.AutoMigrate(
		&models.Pet{},
		&models.Adoption{},
		&models.User{},
	); err != nil {
		return fmt.Errorf("falha no AutoMigrate: %w", err)
	}

	log.Println("AutoMigrate concluído com sucesso.")
	return nil
}
