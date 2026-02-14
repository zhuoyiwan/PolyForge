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

  it("go-gin + full module set", async () => {
    const root = await mkRoot();
    await runCreate("app6", {
      yes: true,
      targetDir: root,
      frontend: "none",
      backend: "go-gin",
      data: "redis",
      modules: "python-worker,worker-go,gateway-bff,python-ai,grpc-service,mq,cache-redis,observability,auth-center",
      docker: true,
    });

    expect(await fs.pathExists(path.join(root, "app6", "apps", "worker-python", "worker.py"))).toBe(true);
    expect(await fs.pathExists(path.join(root, "app6", "apps", "worker-go", "cmd", "worker", "main.go"))).toBe(true);
    expect(await fs.pathExists(path.join(root, "app6", "apps", "gateway-bff", "server.js"))).toBe(true);
    expect(await fs.pathExists(path.join(root, "app6", "apps", "python-ai", "app", "main.py"))).toBe(true);
    expect(await fs.pathExists(path.join(root, "app6", "contracts", "proto", "greeter.proto"))).toBe(true);
    expect(await fs.pathExists(path.join(root, "app6", "infra", "mq", "README.md"))).toBe(true);
    expect(await fs.pathExists(path.join(root, "app6", "infra", "cache", "README.md"))).toBe(true);
    expect(await fs.pathExists(path.join(root, "app6", "infra", "observability", "README.md"))).toBe(true);
    expect(await fs.pathExists(path.join(root, "app6", "apps", "auth-center", "server.js"))).toBe(true);
    expect(await fs.pathExists(path.join(root, "app6", "infra", "docker", "docker-compose.yml"))).toBe(true);
  });

  it("react frontend includes env/proxy/request wiring", async () => {
    const root = await mkRoot();
    await runCreate("app7", {
      yes: true,
      targetDir: root,
      frontend: "react",
      backend: "go-gin",
      data: "none",
      modules: "gateway-bff",
    });

    const envFile = await fs.readFile(path.join(root, "app7", "apps", "web", ".env.example"), "utf8");
    const viteConfig = await fs.readFile(path.join(root, "app7", "apps", "web", "vite.config.ts"), "utf8");
    const appCode = await fs.readFile(path.join(root, "app7", "apps", "web", "src", "App.tsx"), "utf8");
    const clientCode = await fs.readFile(path.join(root, "app7", "apps", "web", "src", "api", "client.ts"), "utf8");
    const requestCode = await fs.readFile(path.join(root, "app7", "apps", "web", "src", "api", "request.ts"), "utf8");

    expect(envFile).toContain("VITE_API_BASE=/api");
    expect(viteConfig).toContain("\"/api\"");
    expect(viteConfig).toContain("\"/bff\"");
    expect(appCode).toContain("Call API /api/v1/ping");
    expect(appCode).toContain("Call BFF /bff/ping");
    expect(appCode).toContain("pingApi");
    expect(appCode).toContain("availableServices");
    expect(clientCode).toContain("export { type ApiPayload, getApiBase, healthApi, pingApi, getBffBase };");
    expect(clientCode).toContain("export async function pingBff()");
    expect(clientCode).toContain("availableServices");
    expect(requestCode).toContain("timeoutMs");
    expect(requestCode).toContain("retries");
    expect(requestCode).toContain("ApiRequestError");
  });

  it("vue frontend renders bff toggle placeholder", async () => {
    const root = await mkRoot();
    await runCreate("app8", {
      yes: true,
      targetDir: root,
      frontend: "vue",
      backend: "go-gin",
      data: "none",
      modules: "gateway-bff",
    });

    const appCode = await fs.readFile(path.join(root, "app8", "apps", "web", "src", "App.vue"), "utf8");
    const clientCode = await fs.readFile(path.join(root, "app8", "apps", "web", "src", "api", "client.ts"), "utf8");
    const requestCode = await fs.readFile(path.join(root, "app8", "apps", "web", "src", "api", "request.ts"), "utf8");
    expect(appCode).toContain("const HAS_BFF = hasBffEnabled();");
    expect(appCode).toContain("pingApi");
    expect(clientCode).toContain("export async function pingBff()");
    expect(clientCode).toContain("availableServices");
    expect(requestCode).toContain("timeoutMs");
  });
});
