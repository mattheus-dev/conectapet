package main

import (
	"log"

	"conectapet/internal/database"
	"conectapet/internal/handlers"
	"conectapet/internal/middleware"

	"github.com/gin-gonic/gin"
)

func main() {
	db, err := database.Connect("conectapet.db")
	if err != nil {
		log.Fatalf("Erro ao conectar ao banco de dados: %v", err)
	}

	if err := database.Migrate(db); err != nil {
		log.Fatalf("Erro na migração do banco de dados: %v", err)
	}

	router := gin.New()
	router.Use(gin.Recovery())
	router.Use(middleware.CORS())
	router.Use(middleware.RequestLogger())

	router.GET("/ping", handlers.Ping)

	petHandler := handlers.NewPetHandler(db)
	adoptionHandler := handlers.NewAdoptionHandler(db)

	api := router.Group("/api")
	{
		// Pets
		// GET  /api/pets         → lista pets com status Disponível
		// POST /api/pets         → cadastra novo pet
		// GET  /api/pets/:id     → detalha um pet
		// PATCH /api/pets/:id/status → atualiza status do pet
		api.GET("/pets", petHandler.ListAvailablePets)
		api.POST("/pets", petHandler.CreatePet)
		api.GET("/pets/:id", petHandler.GetPet)
		api.PATCH("/pets/:id/status", petHandler.UpdatePetStatus)

		// Adoções
		// POST  /api/adopt              → abre solicitação de adoção
		// GET   /api/adoptions          → lista solicitações (filtro: ?status=)
		// GET   /api/adoptions/:id      → detalha solicitação
		// PATCH /api/adoptions/:id/status → aprova ou rejeita adoção
		api.POST("/adopt", adoptionHandler.Adopt)
		api.GET("/adoptions", adoptionHandler.ListAdoptions)
		api.GET("/adoptions/:id", adoptionHandler.GetAdoption)
		api.PATCH("/adoptions/:id/status", adoptionHandler.UpdateAdoptionStatus)
	}

	log.Println("ConectaPet API rodando na porta :8080")
	if err := router.Run(":8080"); err != nil {
		log.Fatalf("Falha ao iniciar o servidor: %v", err)
	}
}
