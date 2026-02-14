def run_sample_task(payload: dict) -> dict:
    return {
        "status": "ok",
        "traceId": payload.get("traceId", "generated-trace-id"),
        "data": payload,
    }
