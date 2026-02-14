#!/usr/bin/env bash
set -euo pipefail

docker compose -f infra/observability/docker-compose.yml up -d
