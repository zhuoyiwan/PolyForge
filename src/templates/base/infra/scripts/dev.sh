#!/usr/bin/env bash
set -euo pipefail

echo "[dev] starting minimal development flow"

if [[ -d apps/web ]]; then
  echo "[dev] frontend available at apps/web"
fi

if [[ -f apps/api/go.mod ]]; then
  if command -v go >/dev/null 2>&1; then
    echo "[dev] running go api"
    (cd apps/api && go mod tidy && go run ./cmd/server)
  else
    echo "[dev] go missing, skip api startup"
  fi
elif [[ -f apps/api/pom.xml ]]; then
  if command -v mvn >/dev/null 2>&1; then
    echo "[dev] running spring api"
    (cd apps/api && mvn spring-boot:run)
  else
    echo "[dev] maven missing, skip api startup"
  fi
fi

if [[ -f apps/gateway-bff/server.js ]]; then
  echo "[dev] gateway-bff available at apps/gateway-bff"
fi

if [[ -f apps/python-ai/app/main.py ]]; then
  echo "[dev] python-ai available at apps/python-ai"
fi
