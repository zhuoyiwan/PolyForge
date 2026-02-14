package middleware

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"hybrid-demo-cli-v2/apps/api/pkg/response"
)

func Recover() gin.HandlerFunc {
	return gin.CustomRecovery(func(c *gin.Context, recovered any) {
		traceID, _ := c.Get(TraceIDKey)
		response.Error(c, http.StatusInternalServerError, 10000, "internal server error", traceIDString(traceID))
		c.Abort()
	})
}

func traceIDString(v any) string {
	if s, ok := v.(string); ok {
		return s
	}
	return ""
}
