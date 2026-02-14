package tasks

import (
	"errors"
	"fmt"
	"log"
	"sync"
	"time"
)

type JobStatus string

const (
	StatusPending   JobStatus = "pending"
	StatusRunning   JobStatus = "running"
	StatusSuccess   JobStatus = "success"
	StatusFailed    JobStatus = "failed"
	StatusDeadLetter JobStatus = "dead-letter"
)

type Job struct {
	ID        string
	Name      string
	Attempts  int
	MaxRetry  int
	Status    JobStatus
	UpdatedAt time.Time
}

var (
	mu         sync.Mutex
	registry   = map[string]*Job{}
	deadLetter = map[string]*Job{}
)

func RegisterJob(name string, maxRetry int) string {
	mu.Lock()
	defer mu.Unlock()
	id := fmt.Sprintf("job-%d", time.Now().UnixNano())
	registry[id] = &Job{ID: id, Name: name, MaxRetry: maxRetry, Status: StatusPending, UpdatedAt: time.Now()}
	return id
}

func RunJob(id string, fn func() error) {
	mu.Lock()
	job, ok := registry[id]
	mu.Unlock()
	if !ok {
		log.Printf("job not found: %s", id)
		return
	}

	for attempt := 1; attempt <= job.MaxRetry+1; attempt++ {
		updateStatus(job, StatusRunning)
		err := fn()
		if err == nil {
			job.Attempts = attempt
			updateStatus(job, StatusSuccess)
			log.Printf("job=%s success attempts=%d", job.ID, attempt)
			return
		}

		job.Attempts = attempt
		log.Printf("job=%s failed attempts=%d err=%v", job.ID, attempt, err)
		if attempt > job.MaxRetry {
			updateStatus(job, StatusDeadLetter)
			mu.Lock()
			deadLetter[job.ID] = job
			mu.Unlock()
			return
		}
		time.Sleep(500 * time.Millisecond)
	}
}

func updateStatus(job *Job, status JobStatus) {
	mu.Lock()
	defer mu.Unlock()
	job.Status = status
	job.UpdatedAt = time.Now()
}

func ListJobs() []Job {
	mu.Lock()
	defer mu.Unlock()
	items := make([]Job, 0, len(registry))
	for _, job := range registry {
		items = append(items, *job)
	}
	return items
}

func ListDeadLetters() []Job {
	mu.Lock()
	defer mu.Unlock()
	items := make([]Job, 0, len(deadLetter))
	for _, job := range deadLetter {
		items = append(items, *job)
	}
	return items
}

func RunHeartbeatTask() {
	jobID := RegisterJob("heartbeat", 2)
	RunJob(jobID, func() error {
		if time.Now().Unix()%5 == 0 {
			return errors.New("simulated intermittent failure")
		}
		log.Println("worker-go heartbeat task executed")
		return nil
	})
}
