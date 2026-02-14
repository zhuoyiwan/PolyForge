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

echo "[check] done"
