# PolyForge Scaffold CLI

PolyForge is a hybrid full-stack scaffold CLI for `go-gin` and `springboot`.
CLI command remains `scaffold`.

## Install

```bash
# one-off run
npx polyforge-cli@latest list

# global install
npm i -g polyforge-cli
scaffold list
```

## Commands

```bash
npm run build
node dist/index.js doctor
node dist/index.js create my-app
node dist/index.js list
npm run smoke:e2e
```

### create options

- `--frontend <react|vue|none>`
- `--backend <go-gin|springboot>`
- `--modules <python-worker,worker-go,gateway-bff,python-ai,grpc-service,mq,cache-redis,observability,auth-center>`
- `--data <mysql,postgresql,redis,sqlite,mongodb,none>`
- `--pm <pnpm|npm|yarn>`
- `--install`
- `--git`
- `--docker`
- `--yes`

### doctor options

- `--backend <go-gin|springboot>`
- `--modules <python-worker,worker-go,gateway-bff,python-ai,grpc-service,mq,cache-redis,observability,auth-center>`
- `--data <mysql,postgresql,redis,sqlite,mongodb,none>`

## Development

```bash
npm run lint
npm run test
npm run build
```

## Publish To npm

```bash
npm login
npm publish
```

## Frontend Auto-Wiring

- React/Vue templates include `.env.example` with API/BFF base URLs.
- Vite dev server proxy routes `/api` -> backend API and `/bff` -> gateway-bff.
- Frontend page includes demo requests for `/api/v1/ping` and `/bff/ping` with `X-Trace-Id`.
- Frontend templates include `src/api/request.ts` (timeout/retry/error mapping), `src/api/services/*`, and `src/api/client.ts`.

## Module Runtime Notes

- `grpc-service`: includes runnable Go gRPC server skeleton and proto generation script.
- `mq`: includes local broker compose (`kafka`, `rabbitmq`, `nats`) and producer/consumer sample scripts.
- `cache-redis`: includes cache key convention and minimal cache client example.
- `observability`: includes local compose (`otel-collector`, `prometheus`, `grafana`) and up/down scripts.
- `auth-center`: includes JWT login/refresh/verify endpoints (minimal flow).
