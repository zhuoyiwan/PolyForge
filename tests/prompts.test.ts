import { beforeEach, describe, expect, it, vi } from "vitest";

const promptMock = vi.fn();
vi.mock("prompts", () => ({
  default: promptMock,
}));

describe("resolveCreateConfig", () => {
  beforeEach(() => {
    promptMock.mockReset();
  });

  it("uses CLI options over prompt answers", async () => {
    promptMock.mockResolvedValue({
      frontend: "vue",
      backendMain: "springboot",
      dataModules: ["sqlite"],
      packageManager: "yarn",
    });

    const { resolveCreateConfig } = await import("../src/core/prompts");
    const config = await resolveCreateConfig("demo", {
      frontend: "react",
      backend: "go-gin",
      data: "mysql,redis",
      pm: "npm",
      yes: false,
      targetDir: "/tmp",
    });

    expect(config.frontend).toBe("react");
    expect(config.backendMain).toBe("go-gin");
    expect(config.dataModules).toEqual(["mysql", "redis"]);
    expect(config.packageManager).toBe("npm");
  });

  it("falls back to defaults when yes is true", async () => {
    const { resolveCreateConfig } = await import("../src/core/prompts");
    const config = await resolveCreateConfig("demo", { yes: true, targetDir: "/tmp" });

    expect(config.frontend).toBe("react");
    expect(config.backendMain).toBe("go-gin");
    expect(config.dataModules).toEqual(["none"]);
    expect(promptMock).not.toHaveBeenCalled();
  });

  it("supports interactive answers for missing fields", async () => {
    promptMock.mockResolvedValue({
      frontend: "vue",
      backendMain: "springboot",
      extraModules: ["python-worker"],
      dataModules: ["sqlite"],
      packageManager: "pnpm",
      installDeps: true,
      initGit: true,
      docker: true,
    });

    const { resolveCreateConfig } = await import("../src/core/prompts");
    const config = await resolveCreateConfig("demo", { targetDir: "/tmp" });

    expect(config.frontend).toBe("vue");
    expect(config.backendMain).toBe("springboot");
    expect(config.extraModules).toEqual(["python-worker"]);
    expect(config.dataModules).toEqual(["sqlite"]);
    expect(config.installDeps).toBe(true);
    expect(config.initGit).toBe(true);
    expect(config.docker).toBe(true);
  });
});
