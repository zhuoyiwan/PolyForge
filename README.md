# scaffold-hybrid-cli

Hybrid full-stack scaffold CLI for `go-gin` and `springboot` with optional `python-worker`.

## Commands

```bash
npm run build
node dist/index.js doctor
node dist/index.js create my-app
npm run smoke:e2e
```

### create options

- `--frontend <react|vue|none>`
- `--backend <go-gin|springboot>`
- `--modules <python-worker>`
- `--data <mysql,postgresql,redis,sqlite,mongodb,none>`
- `--pm <pnpm|npm|yarn>`
- `--install`
- `--git`
- `--docker`
- `--yes`

### doctor options

- `--backend <go-gin|springboot>`
- `--modules <python-worker>`
- `--data <mysql,postgresql,redis,sqlite,mongodb,none>`

## Development

```bash
npm run lint
npm run test
npm run build
```
