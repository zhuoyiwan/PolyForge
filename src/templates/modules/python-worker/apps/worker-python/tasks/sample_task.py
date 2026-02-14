import random
from datetime import datetime, timezone


def run_sample_task(payload: dict) -> dict:
    if payload.get("force_fail"):
        raise RuntimeError("forced failure")

    if not payload.get("disable_random") and random.randint(1, 8) == 1:
        raise RuntimeError("simulated intermittent failure")

    return {
        "status": "ok",
        "traceId": payload.get("traceId", "generated-trace-id"),
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "data": payload,
    }
