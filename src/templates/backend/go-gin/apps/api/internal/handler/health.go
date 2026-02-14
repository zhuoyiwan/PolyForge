package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"{{PROJECT_NAME}}/apps/api/internal/middleware"
	"{{PROJECT_NAME}}/apps/api/internal/repository"
	"{{PROJECT_NAME}}/apps/api/internal/service"
	"{{PROJECT_NAME}}/apps/api/pkg/response"
)

type Handler struct {
	pingService *service.PingService
}

func New() *Handler {
	repo := repository.NewPingRepository()
	return &Handler{
		pingService: service.NewPingService(repo),
	}
}

func (h *Handler) Health(c *gin.Context) {
	traceID, _ := c.Get(middleware.TraceIDKey)
	response.Success(c, http.StatusOK, gin.H{"status": "ok"}, traceIDString(traceID))
}
