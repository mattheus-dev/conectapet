package database

import (
	"fmt"
	"log"
	"strings"

	"conectapet/internal/models"

	"gorm.io/driver/postgres"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

// Connect abre a conexão com o banco de dados.
// Se o DSN começar com "postgres://" ou "postgresql://", usa PostgreSQL (produção).
// Caso contrário, usa SQLite (desenvolvimento local).
func Connect(dsn string) (*gorm.DB, error) {
	var dialector gorm.Dialector

	if strings.HasPrefix(dsn, "postgres://") || strings.HasPrefix(dsn, "postgresql://") {
		log.Println("Conectando ao PostgreSQL...")
		dialector = postgres.Open(dsn)
	} else {
		log.Println("Conectando ao SQLite (local)...")
		dialector = sqlite.Open(dsn)
	}

	db, err := gorm.Open(dialector, &gorm.Config{
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
