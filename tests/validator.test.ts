import { describe, expect, it } from "vitest";
import { validateConfig } from "../src/core/validator";
import type { CreateConfig } from "../src/types/config";

function baseConfig(): CreateConfig {
  return {
    projectName: "demo",
    frontend: "react",
    backendMain: "go-gin",
    extraModules: [],
    dataModules: ["none"],
    packageManager: "npm",
    installDeps: false,
    initGit: false,
    docker: false,
    targetDir: "/tmp/demo",
  };
}

describe("validateConfig", () => {
  it("rejects none with other data modules", () => {
    const config = baseConfig();
    config.dataModules = ["none", "mysql"];

    const result = validateConfig(config);
    expect(result.valid).toBe(false);
    expect(result.errors.join(" ")).toContain("cannot be combined");
  });

  it("warns for springboot + sqlite", () => {
    const config = baseConfig();
    config.backendMain = "springboot";
    config.dataModules = ["sqlite"];

    const result = validateConfig(config);
    expect(result.valid).toBe(true);
    expect(result.warnings.length).toBeGreaterThan(0);
  });

  it("warns when python-worker selected", () => {
    const config = baseConfig();
    config.extraModules = ["python-worker"];

    const result = validateConfig(config);
    expect(result.valid).toBe(true);
    expect(result.warnings.join(" ")).toContain("python-worker");
  });

  it("rejects duplicated data module selection", () => {
    const config = baseConfig();
    config.dataModules = ["mysql", "mysql"];

    const result = validateConfig(config);
    expect(result.valid).toBe(false);
    expect(result.errors.join(" ")).toContain("duplicates");
  });
});
