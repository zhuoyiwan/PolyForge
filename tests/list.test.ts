import { describe, expect, it, vi } from "vitest";
import { runList } from "../src/commands/list";

describe("list command", () => {
  it("prints supported options and defaults", async () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});

    await runList();

    const output = spy.mock.calls.map((line) => line.join(" ")).join("\n");
    expect(output).toContain("frontend:");
    expect(output).toContain("backend:");
    expect(output).toContain("modules:");
    expect(output).toContain("data:");
    expect(output).toContain("Defaults (--yes)");
    expect(output).toContain("go-gin");
    expect(output).toContain("springboot");
    expect(output).toContain("python-worker");
    expect(output).toContain("data=none is mutually exclusive");

    spy.mockRestore();
  });
});
