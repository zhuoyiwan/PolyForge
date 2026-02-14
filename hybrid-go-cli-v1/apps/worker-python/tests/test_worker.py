import unittest

from tasks.sample_task import run_sample_task


class WorkerTestCase(unittest.TestCase):
    def test_sample_task(self) -> None:
        output = run_sample_task({"x": 1})
        self.assertEqual(output["status"], "ok")


if __name__ == "__main__":
    unittest.main()
