#!/usr/bin/env bash
set -euo pipefail

# placeholder generation command; adjust plugins/language as needed
protoc \
  --proto_path=contracts/proto \
  --go_out=apps/grpc-service \
  --go-grpc_out=apps/grpc-service \
  contracts/proto/greeter.proto
