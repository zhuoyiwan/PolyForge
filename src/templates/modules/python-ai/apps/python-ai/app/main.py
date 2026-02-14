from fastapi import FastAPI, Header
from typing import Optional
from datetime import datetime, timezone

app = FastAPI()


@app.get("/health")
def health(trace_id: Optional[str] = Header(default=None, alias="X-Trace-Id")):
    return {
        "code": 0,
        "message": "success",
        "data": {"status": "ok", "model": "placeholder"},
        "traceId": trace_id or "python-ai-trace",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


@app.post("/infer")
def infer(payload: dict, trace_id: Optional[str] = Header(default=None, alias="X-Trace-Id")):
    return {
        "code": 0,
        "message": "success",
        "data": {"result": "placeholder", "input": payload},
        "traceId": trace_id or "python-ai-trace",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
