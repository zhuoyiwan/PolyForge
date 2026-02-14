import { spawn } from "child_process";
import type { CreateConfig } from "../types/config";

function run(cmd: string, args: string[], cwd: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { cwd, stdio: "ignore" });
    child.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${cmd} ${args.join(" ")} failed with code ${code}`));
    });
  });
}

export async function maybeInitGit(config: CreateConfig): Promise<void> {
  if (!config.initGit) return;
  try {
    await run("git", ["init"], config.targetDir);
  } catch {
    console.warn("[scaffold] skip git init (git unavailable)");
  }
}
