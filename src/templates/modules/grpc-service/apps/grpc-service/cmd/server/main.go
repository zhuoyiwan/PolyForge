package main

import (
	"log"
	"net"

	"google.golang.org/grpc"
	"google.golang.org/grpc/health"
	grpcHealth "google.golang.org/grpc/health/grpc_health_v1"
)

func main() {
	lis, err := net.Listen("tcp", ":9090")
	if err != nil {
		log.Fatal(err)
	}

	srv := grpc.NewServer()
	healthSrv := health.NewServer()
	healthSrv.SetServingStatus("grpc-service", grpcHealth.HealthCheckResponse_SERVING)
	grpcHealth.RegisterHealthServer(srv, healthSrv)

	log.Println("grpc-service listening on :9090")
	if err := srv.Serve(lis); err != nil {
		log.Fatal(err)
	}
}
