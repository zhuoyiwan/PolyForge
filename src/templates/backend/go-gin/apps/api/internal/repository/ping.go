package repository

type PingRepo struct{}

func NewPingRepository() *PingRepo {
	return &PingRepo{}
}

func (r *PingRepo) Message() string {
	return "pong"
}
