package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"hybrid-demo-cli-v2/apps/api/internal/middleware"
	"hybrid-demo-cli-v2/apps/api/internal/repository"
	"hybrid-demo-cli-v2/apps/api/internal/service"
	"hybrid-demo-cli-v2/apps/api/pkg/response"
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
