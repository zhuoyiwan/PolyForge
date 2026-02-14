package middleware

import (
	"log"
	"time"

	"github.com/gin-gonic/gin"
)

func RequestLogger() gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()
		c.Next()
		latency := time.Since(start)
		traceID, _ := c.Get(TraceIDKey)
		log.Printf("traceId=%v method=%s path=%s status=%d latency=%s", traceID, c.Request.Method, c.Request.URL.Path, c.Writer.Status(), latency)
	}
}
