from datetime import datetime, timezone
from tasks.sample_task import run_sample_task


class WorkerState:
    def __init__(self) -> None:
        self.jobs = {}
        self.dead_letters = {}


STATE = WorkerState()


def process_job(job_id: str, payload: dict, max_retry: int = 2) -> None:
    for attempt in range(max_retry + 1):
        try:
            STATE.jobs[job_id] = {
                "id": job_id,
                "attempt": attempt + 1,
                "status": "running",
                "updatedAt": datetime.now(timezone.utc).isoformat(),
            }
            result = run_sample_task(payload)
            STATE.jobs[job_id] = {
                "id": job_id,
                "attempt": attempt + 1,
                "status": "success",
                "result": result,
                "updatedAt": datetime.now(timezone.utc).isoformat(),
            }
            print(f"[worker-python] success: {STATE.jobs[job_id]}")
            return
        except Exception as exc:
            if attempt >= max_retry:
                STATE.dead_letters[job_id] = {
                    "id": job_id,
                    "status": "dead-letter",
                    "error": str(exc),
                    "updatedAt": datetime.now(timezone.utc).isoformat(),
                }
                print(f"[worker-python] dead-letter: {STATE.dead_letters[job_id]}")
                return


def main() -> None:
    process_job("job-1", {"input": "demo"})
    print(f"[worker-python] jobs={STATE.jobs}")
    print(f"[worker-python] dead_letters={STATE.dead_letters}")


if __name__ == "__main__":
    main()
