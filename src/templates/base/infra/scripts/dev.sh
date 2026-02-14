#!/usr/bin/env bash
set -euo pipefail

echo "[dev] starting minimal development flow"

declare -a BG_PIDS=()
cleanup() {
  for pid in "${BG_PIDS[@]}"; do
    if kill -0 "$pid" >/dev/null 2>&1; then
      kill "$pid" >/dev/null 2>&1 || true
      wait "$pid" >/dev/null 2>&1 || true
    fi
  done
}
trap cleanup EXIT INT TERM

start_bg() {
  local name="$1"
  shift
  echo "[dev] starting ${name}"
  (
    "$@"
  ) &
  BG_PIDS+=("$!")
}

detect_pm() {
  if [[ -f pnpm-lock.yaml ]]; then
    echo "pnpm"
    return
  fi
  if [[ -f yarn.lock ]]; then
    echo "yarn"
    return
  fi
  echo "npm"
}

if [[ -f apps/api/go.mod ]]; then
  if command -v go >/dev/null 2>&1; then
    start_bg "go api" bash -lc "cd apps/api && go mod tidy && go run ./cmd/server"
  else
    echo "[dev] go missing, skip api startup"
  fi
elif [[ -f apps/api/pom.xml ]]; then
  if command -v mvn >/dev/null 2>&1; then
    start_bg "spring api" bash -lc "cd apps/api && mvn spring-boot:run"
  else
    echo "[dev] maven missing, skip api startup"
  fi
fi

if [[ -f apps/gateway-bff/server.js ]]; then
  if command -v node >/dev/null 2>&1; then
    start_bg "gateway-bff" bash -lc "cd apps/gateway-bff && PORT=3001 node server.js"
  else
    echo "[dev] node missing, skip gateway-bff startup"
  fi
fi

if [[ -f apps/python-ai/app/main.py ]]; then
  if command -v python3 >/dev/null 2>&1; then
    if python3 -c "import uvicorn" >/dev/null 2>&1; then
      start_bg "python-ai" bash -lc "cd apps/python-ai && python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8090"
    else
      echo "[dev] uvicorn missing, skip python-ai startup"
    fi
  else
    echo "[dev] python3 missing, skip python-ai startup"
  fi
fi

if [[ -f apps/auth-center/server.js ]]; then
  if command -v node >/dev/null 2>&1; then
    start_bg "auth-center" bash -lc "cd apps/auth-center && PORT=8081 node server.js"
  else
    echo "[dev] node missing, skip auth-center startup"
  fi
fi

if [[ -f infra/mq/docker-compose.yml ]]; then
  echo "[dev] mq stack available at infra/mq/docker-compose.yml"
fi

if [[ -f apps/mq-worker/package.json ]]; then
  echo "[dev] mq-worker available at apps/mq-worker"
fi

if [[ -f infra/observability/docker-compose.yml ]]; then
  echo "[dev] observability stack available at infra/observability/docker-compose.yml"
fi

if [[ -d apps/web ]]; then
  PM="$(detect_pm)"
  if command -v "$PM" >/dev/null 2>&1; then
    echo "[dev] starting frontend with ${PM}"
    cd apps/web
    exec "$PM" run dev
  else
    echo "[dev] ${PM} missing, skip frontend startup"
  fi
fi

if [[ "${#BG_PIDS[@]}" -gt 0 ]]; then
  echo "[dev] no frontend found, waiting on backend/module services"
  wait
fi
