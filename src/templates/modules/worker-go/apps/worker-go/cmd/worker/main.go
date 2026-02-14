package main

import (
	"log"
	"time"

	"{{PROJECT_NAME}}/apps/worker-go/internal/tasks"
)

func main() {
	log.Println("worker-go started")
	for {
		tasks.RunHeartbeatTask()
		time.Sleep(10 * time.Second)
	}
}
