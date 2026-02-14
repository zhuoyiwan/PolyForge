package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"hybrid-demo-cli-v2/apps/api/internal/middleware"
	"hybrid-demo-cli-v2/apps/api/pkg/response"
)

func (h *Handler) Ping(c *gin.Context) {
	traceID, _ := c.Get(middleware.TraceIDKey)
	result := h.pingService.Ping()
	response.Success(c, http.StatusOK, gin.H{"message": result}, traceIDString(traceID))
}
