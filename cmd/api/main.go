package main

import (
	"log"
	"os"

	"conectapet/internal/database"
	"conectapet/internal/handlers"
	"conectapet/internal/middleware"

	"github.com/gin-gonic/gin"
)

func main() {
	// Em produção: DATABASE_URL=postgres://user:pass@host/db
	// Em desenvolvimento local: usa SQLite (conectapet.db)
	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		dsn = "conectapet.db"
	}

	db, err := database.Connect(dsn)
	if err != nil {
		log.Fatalf("Erro ao conectar ao banco de dados: %v", err)
	}

	if err := database.Migrate(db); err != nil {
		log.Fatalf("Erro na migração do banco de dados: %v", err)
	}

	if err := database.SeedAdmin(db); err != nil {
		log.Fatalf("Erro ao criar usuário admin: %v", err)
	}

	// Em produção (Render), o Gin deve rodar em modo release
	if os.Getenv("GIN_MODE") == "" && os.Getenv("RENDER") != "" {
		gin.SetMode(gin.ReleaseMode)
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
		public.GET("/pets", petHandler.ListAvailablePets)
		public.GET("/pets/:id", petHandler.GetPet)
		public.POST("/adopt", adoptionHandler.Adopt)
	}

	// ── Rotas protegidas (exigem JWT) ───────────────────────────
	admin := router.Group("/api")
	admin.Use(middleware.JWTAuth())
	{
		admin.POST("/pets", petHandler.CreatePet)
		admin.PATCH("/pets/:id/status", petHandler.UpdatePetStatus)
		admin.DELETE("/pets/:id", petHandler.DeletePet)
		admin.GET("/admin/pets", petHandler.ListAllPets)

		admin.GET("/adoptions", adoptionHandler.ListAdoptions)
		admin.GET("/adoptions/:id", adoptionHandler.GetAdoption)
		admin.PATCH("/adoptions/:id/status", adoptionHandler.UpdateAdoptionStatus)
	}

	// Render injeta a variável PORT; fallback para 8080 localmente
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("ConectaPet API rodando na porta :%s", port)
	if err := router.Run(":" + port); err != nil {
		log.Fatalf("Falha ao iniciar o servidor: %v", err)
	}
}
