package handlers

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

func Ping(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"message":   "pong",
		"service":   "ConectaPet API",
		"timestamp": time.Now().UTC(),
	})
}
