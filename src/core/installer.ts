import { spawn } from "child_process";
import path from "path";
import { existsSync } from "fs";
import type { CreateConfig } from "../types/config";

function run(cmd: string, args: string[], cwd: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { cwd, stdio: "inherit", shell: process.platform === "win32" });
    child.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${cmd} ${args.join(" ")} failed with code ${code}`));
    });
  });
}

export async function maybeInstallDeps(config: CreateConfig): Promise<void> {
  if (!config.installDeps) return;

  if (config.frontend !== "none") {
    const webDir = path.join(config.targetDir, "apps", "web");
    if (existsSync(path.join(webDir, "package.json"))) {
      await run(config.packageManager, ["install"], webDir);
    }
  }

  if (config.extraModules.includes("python-worker")) {
    const pyDir = path.join(config.targetDir, "apps", "worker-python");
    if (existsSync(path.join(pyDir, "requirements.txt"))) {
      try {
        await run("python3", ["-m", "pip", "install", "-r", "requirements.txt"], pyDir);
      } catch {
        console.warn("[scaffold] skip python dependency install (python3/pip unavailable)");
      }
    }
  }

  if (config.extraModules.includes("gateway-bff")) {
    const bffDir = path.join(config.targetDir, "apps", "gateway-bff");
    if (existsSync(path.join(bffDir, "package.json"))) {
      await run(config.packageManager, ["install"], bffDir);
    }
  }

  if (config.extraModules.includes("auth-center")) {
    const authDir = path.join(config.targetDir, "apps", "auth-center");
    if (existsSync(path.join(authDir, "package.json"))) {
      await run(config.packageManager, ["install"], authDir);
    }
  }

  if (config.extraModules.includes("python-ai")) {
    const pyAiDir = path.join(config.targetDir, "apps", "python-ai");
    if (existsSync(path.join(pyAiDir, "requirements.txt"))) {
      try {
        await run("python3", ["-m", "pip", "install", "-r", "requirements.txt"], pyAiDir);
      } catch {
        console.warn("[scaffold] skip python-ai dependency install (python3/pip unavailable)");
      }
    }
  }
}
