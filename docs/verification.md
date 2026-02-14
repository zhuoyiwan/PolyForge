# Verification Matrix

Implemented integration matrix:

1. react + go-gin + mysql + redis
2. vue + springboot + postgresql + redis
3. none + go-gin + sqlite
4. react + springboot + sqlite + python-worker
5. vue + go-gin + mongodb + python-worker

All above are covered in `tests/integration/create.integration.test.ts`.

End-to-end smoke command:

```bash
npm run smoke:e2e
```
