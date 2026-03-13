package middleware

import (
	"log"
	"time"

	"github.com/gin-gonic/gin"
)

func RequestLogger() gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()
		path := c.Request.URL.Path

		c.Next()

		duration := time.Since(start)
		log.Printf("[%s] %s %s | status: %d | duração: %v",
			c.Request.Method,
			path,
			c.ClientIP(),
			c.Writer.Status(),
			duration,
		)
	}
}
