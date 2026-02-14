#!/usr/bin/env bash
set -euo pipefail

echo "[build] building project"
if [[ -d apps/web && -f apps/web/package.json ]]; then
  if command -v npm >/dev/null 2>&1; then
    (cd apps/web && npm run build || true)
  fi
fi

if [[ -f apps/api/go.mod ]]; then
  if command -v go >/dev/null 2>&1; then
    (cd apps/api && go mod tidy && go build ./...)
  fi
elif [[ -f apps/api/pom.xml ]]; then
  if command -v mvn >/dev/null 2>&1; then
    (cd apps/api && mvn -q -DskipTests package)
  fi
fi

if [[ -f apps/worker-go/go.mod ]]; then
  if command -v go >/dev/null 2>&1; then
    (cd apps/worker-go && go mod tidy && go build ./...)
  fi
fi

if [[ -f apps/gateway-bff/package.json ]]; then
  if command -v npm >/dev/null 2>&1; then
    (cd apps/gateway-bff && npm run build || true)
  fi
fi

if [[ -f apps/auth-center/package.json ]]; then
  if command -v npm >/dev/null 2>&1; then
    (cd apps/auth-center && npm run build || true)
  fi
fi

echo "[build] done"
