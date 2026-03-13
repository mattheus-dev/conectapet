package middleware

import (
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
)

// CORS configura os cabeçalhos de Cross-Origin Resource Sharing.
// Em produção, define o domínio permitido via variável de ambiente FRONTEND_URL.
// Em desenvolvimento local, usa http://localhost:5173 (Vite dev server).
func CORS() gin.HandlerFunc {
	return func(c *gin.Context) {
		origin := os.Getenv("FRONTEND_URL")
		if origin == "" {
			origin = "http://localhost:5173"
		}

		c.Header("Access-Control-Allow-Origin", origin)
		c.Header("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Origin, Content-Type, Accept, Authorization")
		c.Header("Access-Control-Expose-Headers", "Content-Length")
		c.Header("Access-Control-Max-Age", "86400")

		if c.Request.Method == http.MethodOptions {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}

		c.Next()
	}
}
