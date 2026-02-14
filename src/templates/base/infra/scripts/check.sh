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

echo "[check] done"
