import path from "path";
import os from "os";
import fs from "fs-extra";
import { afterEach, describe, expect, it } from "vitest";
import { runCreate } from "../../src/commands/create";

const tmpRoots: string[] = [];

async function mkRoot() {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "scaffold-it-"));
  tmpRoots.push(root);
  return root;
}

afterEach(async () => {
  while (tmpRoots.length) {
    const dir = tmpRoots.pop();
    if (dir) await fs.remove(dir);
  }
});

describe("create integration matrix", () => {
  it("react + go-gin + mysql + redis", async () => {
    const root = await mkRoot();
    await runCreate("app1", {
      yes: true,
      targetDir: root,
      frontend: "react",
      backend: "go-gin",
      data: "mysql,redis",
    });

    expect(await fs.pathExists(path.join(root, "app1", "apps", "api", "go.mod"))).toBe(true);
    expect(await fs.pathExists(path.join(root, "app1", "apps", "web", "package.json"))).toBe(true);
    expect(await fs.pathExists(path.join(root, "app1", "infra", "data", "mysql", "README.md"))).toBe(true);
    expect(await fs.pathExists(path.join(root, "app1", "infra", "data", "redis", "README.md"))).toBe(true);
  });

  it("vue + springboot + postgresql + redis", async () => {
    const root = await mkRoot();
    await runCreate("app2", {
      yes: true,
      targetDir: root,
      frontend: "vue",
      backend: "springboot",
      data: "postgresql,redis",
    });

    expect(await fs.pathExists(path.join(root, "app2", "apps", "api", "pom.xml"))).toBe(true);
    expect(await fs.pathExists(path.join(root, "app2", "apps", "web", "package.json"))).toBe(true);
    expect(await fs.pathExists(path.join(root, "app2", "infra", "data", "postgresql", "README.md"))).toBe(true);
  });

  it("none + go-gin + sqlite", async () => {
    const root = await mkRoot();
    await runCreate("app3", {
      yes: true,
      targetDir: root,
      frontend: "none",
      backend: "go-gin",
      data: "sqlite",
    });

    expect(await fs.pathExists(path.join(root, "app3", "apps", "web"))).toBe(false);
    expect(await fs.pathExists(path.join(root, "app3", "infra", "data", "sqlite", "README.md"))).toBe(true);
  });

  it("react + springboot + sqlite + python-worker", async () => {
    const root = await mkRoot();
    await runCreate("app4", {
      yes: true,
      targetDir: root,
      frontend: "react",
      backend: "springboot",
      data: "sqlite",
      modules: "python-worker",
    });

    expect(await fs.pathExists(path.join(root, "app4", "apps", "worker-python", "worker.py"))).toBe(true);
    expect(await fs.pathExists(path.join(root, "app4", "apps", "api", "pom.xml"))).toBe(true);
  });

  it("vue + go-gin + mongodb + python-worker", async () => {
    const root = await mkRoot();
    await runCreate("app5", {
      yes: true,
      targetDir: root,
      frontend: "vue",
      backend: "go-gin",
      data: "mongodb",
      modules: "python-worker",
    });

    expect(await fs.pathExists(path.join(root, "app5", "apps", "api", "go.mod"))).toBe(true);
    expect(await fs.pathExists(path.join(root, "app5", "infra", "data", "mongodb", "README.md"))).toBe(true);
    expect(await fs.pathExists(path.join(root, "app5", "apps", "worker-python", "worker.py"))).toBe(true);
  });
});
