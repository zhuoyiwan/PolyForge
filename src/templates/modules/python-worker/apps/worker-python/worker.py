from tasks.sample_task import run_sample_task


def main() -> None:
    result = run_sample_task({"input": "demo"})
    print(f"worker result: {result}")


if __name__ == "__main__":
    main()
