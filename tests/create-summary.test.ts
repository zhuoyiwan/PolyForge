import path from "path";
import os from "os";
import fs from "fs-extra";
import { afterEach, describe, expect, it, vi } from "vitest";
import { runCreate } from "../src/commands/create";

const roots: string[] = [];

afterEach(async () => {
  vi.restoreAllMocks();
  while (roots.length > 0) {
    const dir = roots.pop();
    if (dir) await fs.remove(dir);
  }
});

describe("create summary", () => {
  it("prints defaults when --yes is used", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "scaffold-summary-"));
    roots.push(root);
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    await runCreate("demo", { yes: true, targetDir: root });

    const output = logSpy.mock.calls.map((call) => call.join(" ")).join("\n");
    expect(output).toContain("--yes defaults applied");
    expect(output).toContain("backend=go-gin");
  });
});
