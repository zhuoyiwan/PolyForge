package service

type PingRepository interface {
	Message() string
}

type PingService struct {
	repo PingRepository
}

func NewPingService(repo PingRepository) *PingService {
	return &PingService{repo: repo}
}

func (s *PingService) Ping() string {
	return s.repo.Message()
}
