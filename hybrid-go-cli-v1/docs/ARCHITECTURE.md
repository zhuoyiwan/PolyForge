# Architecture Notes

- Unified response payload: code/message/data/traceId/timestamp
- Health endpoint: `/health`
- Trace propagation header: `X-Trace-Id`
- Backend main stack: `go-gin`
- Frontend: `react`
- Data modules: `mysql, redis`
- Extra modules: `python-worker`
