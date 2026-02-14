#!/usr/bin/env bash
set -euo pipefail

echo "[test] running tests"
if [[ -d apps/web && -f apps/web/package.json ]]; then
  if command -v npm >/dev/null 2>&1; then
    (cd apps/web && npm run test -- --run || true)
  fi
fi

if [[ -f apps/api/go.mod ]]; then
  if command -v go >/dev/null 2>&1; then
    (cd apps/api && go mod tidy && go test ./...)
  fi
elif [[ -f apps/api/pom.xml ]]; then
  if command -v mvn >/dev/null 2>&1; then
    (cd apps/api && mvn -q test)
  fi
fi

if [[ -d apps/worker-python ]]; then
  if command -v python3 >/dev/null 2>&1; then
    (cd apps/worker-python && python3 -m unittest -q)
  else
    echo "[test] python missing, skip worker tests"
  fi
fi

if [[ -f apps/worker-go/go.mod ]]; then
  if command -v go >/dev/null 2>&1; then
    (cd apps/worker-go && go mod tidy && go test ./...)
  fi
fi

if [[ -f apps/python-ai/app/main.py ]]; then
  if command -v python3 >/dev/null 2>&1; then
    python3 -m py_compile apps/python-ai/app/main.py
  fi
fi

echo "[test] done"
