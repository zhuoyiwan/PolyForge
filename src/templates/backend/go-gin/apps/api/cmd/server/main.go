package main

import (
	"log"

	"github.com/gin-gonic/gin"

	"{{PROJECT_NAME}}/apps/api/internal/config"
	"{{PROJECT_NAME}}/apps/api/internal/handler"
	"{{PROJECT_NAME}}/apps/api/internal/middleware"
)

func main() {
	cfg := config.Load()

	r := gin.New()
	r.Use(middleware.TraceID())
	r.Use(middleware.RequestLogger())
	r.Use(middleware.Recover())

	h := handler.New()
	r.GET("/health", h.Health)
	r.GET("/api/v1/ping", h.Ping)

	log.Printf("api listening on :%s", cfg.Port)
	if err := r.Run(":" + cfg.Port); err != nil {
		log.Fatal(err)
	}
}
