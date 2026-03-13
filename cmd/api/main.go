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

	if err := database.SeedAdmin(db); err != nil {
		log.Fatalf("Erro ao criar usuário admin: %v", err)
	}

	router := gin.New()
	router.Use(gin.Recovery())
	router.Use(middleware.CORS())
	router.Use(middleware.RequestLogger())

	// ── Handlers ────────────────────────────────────────────────
	petHandler := handlers.NewPetHandler(db)
	adoptionHandler := handlers.NewAdoptionHandler(db)
	authHandler := handlers.NewAuthHandler(db)

	// ── Rotas públicas ──────────────────────────────────────────
	router.GET("/ping", handlers.Ping)

	public := router.Group("/api")
	{
		public.POST("/auth/login", authHandler.Login)

		// Qualquer visitante pode ver pets disponíveis e enviar pedido de adoção
		public.GET("/pets", petHandler.ListAvailablePets)
		public.GET("/pets/:id", petHandler.GetPet)
		public.POST("/adopt", adoptionHandler.Adopt)
	}

	// ── Rotas protegidas (exigem JWT) ───────────────────────────
	admin := router.Group("/api")
	admin.Use(middleware.JWTAuth())
	{
		// Gestão de pets
		admin.POST("/pets", petHandler.CreatePet)
		admin.PATCH("/pets/:id/status", petHandler.UpdatePetStatus)
		admin.DELETE("/pets/:id", petHandler.DeletePet)
		admin.GET("/admin/pets", petHandler.ListAllPets)

		// Gestão de adoções
		admin.GET("/adoptions", adoptionHandler.ListAdoptions)
		admin.GET("/adoptions/:id", adoptionHandler.GetAdoption)
		admin.PATCH("/adoptions/:id/status", adoptionHandler.UpdateAdoptionStatus)
	}

	log.Println("ConectaPet API rodando na porta :8080")
	if err := router.Run(":8080"); err != nil {
		log.Fatalf("Falha ao iniciar o servidor: %v", err)
	}
}
