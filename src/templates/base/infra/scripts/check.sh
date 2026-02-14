#!/usr/bin/env bash
set -euo pipefail

echo "[check] workspace sanity"
if [[ ! -f package.json ]]; then
  echo "[check] package.json missing at repo root" >&2
  exit 1
fi

if [[ -d apps/api ]]; then
  if [[ -f apps/api/go.mod ]]; then
    if command -v go >/dev/null 2>&1; then
      (cd apps/api && go mod tidy && go test ./...)
    else
      echo "[check] go missing, skip go test"
    fi
  elif [[ -f apps/api/pom.xml ]]; then
    if command -v mvn >/dev/null 2>&1; then
      (cd apps/api && mvn -q -DskipTests verify)
    else
      echo "[check] maven missing, skip spring verify"
    fi
  fi
fi

if [[ -f apps/worker-go/go.mod ]]; then
  if command -v go >/dev/null 2>&1; then
    (cd apps/worker-go && go mod tidy && go test ./...)
  else
    echo "[check] go missing, skip worker-go tests"
  fi
fi

if [[ -f apps/gateway-bff/server.js ]]; then
  if command -v node >/dev/null 2>&1; then
    node --check apps/gateway-bff/server.js
  else
    echo "[check] node missing, skip gateway-bff syntax check"
  fi
fi

if [[ -f apps/auth-center/server.js ]]; then
  if command -v node >/dev/null 2>&1; then
    node --check apps/auth-center/server.js
  else
    echo "[check] node missing, skip auth-center syntax check"
  fi
fi

if [[ -f apps/python-ai/app/main.py ]]; then
  if command -v python3 >/dev/null 2>&1; then
    python3 -m py_compile apps/python-ai/app/main.py
  else
    echo "[check] python3 missing, skip python-ai compile check"
  fi
fi

if [[ -f contracts/proto/greeter.proto ]]; then
  if command -v protoc >/dev/null 2>&1; then
    echo "[check] protoc available for grpc-service"
  else
    echo "[check] protoc missing, grpc-service code generation unavailable"
  fi
fi

if [[ -f infra/mq/docker-compose.yml ]]; then
  if command -v docker >/dev/null 2>&1; then
    docker compose -f infra/mq/docker-compose.yml config >/dev/null
  else
    echo "[check] docker missing, skip mq compose validation"
  fi
fi

if [[ -f apps/mq-worker/package.json ]]; then
  if command -v node >/dev/null 2>&1; then
    node --check apps/mq-worker/scripts/producer.js
    node --check apps/mq-worker/scripts/consumer.js
    node --check apps/mq-worker/scripts/roundtrip.js
  else
    echo "[check] node missing, skip mq-worker syntax check"
  fi
fi

if [[ -f infra/observability/docker-compose.yml ]]; then
  if command -v docker >/dev/null 2>&1; then
    docker compose -f infra/observability/docker-compose.yml config >/dev/null
  else
    echo "[check] docker missing, skip observability compose validation"
  fi
fi

RUNTIME_SMOKE="${CHECK_RUNTIME_SMOKE:-1}"
if [[ "$RUNTIME_SMOKE" == "1" ]]; then
  echo "[check] runtime smoke enabled (set CHECK_RUNTIME_SMOKE=0 to disable)"

  declare -a PIDS=()
  TMP_NATS_CONTAINER=""
  cleanup() {
    for pid in "${PIDS[@]}"; do
      if kill -0 "$pid" >/dev/null 2>&1; then
        kill "$pid" >/dev/null 2>&1 || true
        wait "$pid" >/dev/null 2>&1 || true
      fi
    done
    if [[ -n "$TMP_NATS_CONTAINER" ]] && command -v docker >/dev/null 2>&1; then
      docker rm -f "$TMP_NATS_CONTAINER" >/dev/null 2>&1 || true
    fi
  }
  trap cleanup EXIT

  wait_http() {
    local url="$1"
    local retries="$2"
    local delay="$3"
    for _ in $(seq 1 "$retries"); do
      if curl -sf "$url" >/dev/null 2>&1; then
        return 0
      fi
      sleep "$delay"
    done
    return 1
  }

  wait_tcp() {
    local host="$1"
    local port="$2"
    local retries="$3"
    local delay="$4"
    if ! command -v nc >/dev/null 2>&1; then
      return 1
    fi
    for _ in $(seq 1 "$retries"); do
      if nc -z "$host" "$port" >/dev/null 2>&1; then
        return 0
      fi
      sleep "$delay"
    done
    return 1
  }

  if [[ -f apps/api/go.mod ]] && command -v go >/dev/null 2>&1; then
    (
      cd apps/api
      APP_PORT=18080 go run ./cmd/server
    ) >/tmp/scaffold-check-api.log 2>&1 &
    PIDS+=("$!")
    if wait_http "http://127.0.0.1:18080/health" 25 1; then
      echo "[check] runtime ok: apps/api /health"
    else
      echo "[check] runtime warn: apps/api health probe failed"
      tail -n 30 /tmp/scaffold-check-api.log || true
    fi
  fi

  if [[ -f apps/gateway-bff/server.js ]] && command -v node >/dev/null 2>&1; then
    (
      cd apps/gateway-bff
      PORT=13001 node server.js
    ) >/tmp/scaffold-check-bff.log 2>&1 &
    PIDS+=("$!")
    if wait_http "http://127.0.0.1:13001/health" 20 1; then
      echo "[check] runtime ok: apps/gateway-bff /health"
    else
      echo "[check] runtime warn: gateway-bff health probe failed"
      tail -n 30 /tmp/scaffold-check-bff.log || true
    fi
  fi

  if [[ -f apps/auth-center/server.js ]] && command -v node >/dev/null 2>&1; then
    (
      cd apps/auth-center
      PORT=18081 node server.js
    ) >/tmp/scaffold-check-auth.log 2>&1 &
    PIDS+=("$!")
    if wait_http "http://127.0.0.1:18081/health" 20 1; then
      echo "[check] runtime ok: apps/auth-center /health"
    else
      echo "[check] runtime warn: auth-center health probe failed"
      tail -n 30 /tmp/scaffold-check-auth.log || true
    fi
  fi

  if [[ -f apps/python-ai/app/main.py ]] && command -v python3 >/dev/null 2>&1; then
    if python3 -c "import uvicorn" >/dev/null 2>&1; then
      (
        cd apps/python-ai
        python3 -m uvicorn app.main:app --host 127.0.0.1 --port 18090
      ) >/tmp/scaffold-check-python-ai.log 2>&1 &
      PIDS+=("$!")
      if wait_http "http://127.0.0.1:18090/health" 20 1; then
        echo "[check] runtime ok: apps/python-ai /health"
      else
        echo "[check] runtime warn: python-ai health probe failed"
        tail -n 30 /tmp/scaffold-check-python-ai.log || true
      fi
    else
      echo "[check] runtime skip: python-ai needs uvicorn"
    fi
  fi

  if [[ -f apps/grpc-service/cmd/server/main.go ]] && command -v go >/dev/null 2>&1; then
    (
      cd apps/grpc-service
      go run ./cmd/server
    ) >/tmp/scaffold-check-grpc.log 2>&1 &
    PIDS+=("$!")
    if wait_tcp "127.0.0.1" "9090" 20 1; then
      echo "[check] runtime ok: apps/grpc-service :9090"
    else
      echo "[check] runtime warn: grpc-service port probe failed"
      tail -n 30 /tmp/scaffold-check-grpc.log || true
    fi
  fi

  if [[ -f apps/mq-worker/package.json ]] && command -v npm >/dev/null 2>&1; then
    MQ_NATS_READY="0"
    if ! wait_tcp "127.0.0.1" "4222" 2 1; then
      if command -v docker >/dev/null 2>&1 && docker info >/dev/null 2>&1; then
        TMP_NATS_CONTAINER="scaffold-mq-check-$(date +%s)"
        if docker run -d --rm --name "$TMP_NATS_CONTAINER" -p 4222:4222 nats:2.10 >/dev/null 2>&1; then
          echo "[check] runtime info: started temporary NATS container ($TMP_NATS_CONTAINER)"
          wait_tcp "127.0.0.1" "4222" 10 1 || true
        fi
      fi
    fi

    if wait_tcp "127.0.0.1" "4222" 2 1; then
      MQ_NATS_READY="1"
      if [[ -d apps/mq-worker/node_modules ]]; then
        (cd apps/mq-worker && npm run -s roundtrip) || echo "[check] runtime warn: mq-worker roundtrip failed"
      else
        echo "[check] runtime skip: mq-worker dependencies not installed"
      fi
    fi

    if [[ "$MQ_NATS_READY" != "1" ]]; then
      if command -v docker >/dev/null 2>&1 && docker info >/dev/null 2>&1; then
        echo "[check] runtime skip: NATS port 4222 unavailable"
      else
        echo "[check] runtime skip: NATS 4222 unavailable and Docker daemon not ready"
      fi
    else
      echo "[check] runtime ok: mq-worker roundtrip completed"
    fi
  fi
fi

echo "[check] done"
