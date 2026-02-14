package response

import (
	"time"

	"github.com/gin-gonic/gin"
)

type Payload struct {
	Code      int         `json:"code"`
	Message   string      `json:"message"`
	Data      interface{} `json:"data"`
	TraceID   string      `json:"traceId"`
	Timestamp string      `json:"timestamp"`
}

func Success(c *gin.Context, status int, data interface{}, traceID string) {
	c.JSON(status, Payload{
		Code:      0,
		Message:   "success",
		Data:      data,
		TraceID:   traceID,
		Timestamp: time.Now().UTC().Format(time.RFC3339),
	})
}

func Error(c *gin.Context, status int, code int, message string, traceID string) {
	c.JSON(status, Payload{
		Code:      code,
		Message:   message,
		Data:      nil,
		TraceID:   traceID,
		Timestamp: time.Now().UTC().Format(time.RFC3339),
	})
}
