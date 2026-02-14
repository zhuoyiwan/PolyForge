package main

import (
	"encoding/json"
	"log"
	"time"

	"{{PROJECT_NAME}}/apps/worker-go/internal/tasks"
)

func main() {
	log.Println("worker-go started")
	for {
		tasks.RunHeartbeatTask()

		jobs, _ := json.Marshal(tasks.ListJobs())
		dlq, _ := json.Marshal(tasks.ListDeadLetters())
		log.Printf("worker-go state jobs=%s dead_letters=%s", string(jobs), string(dlq))

		time.Sleep(10 * time.Second)
	}
}
