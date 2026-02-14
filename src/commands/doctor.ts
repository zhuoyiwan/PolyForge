import { spawnSync } from "child_process";

interface CheckResult {
  name: string;
  ok: boolean;
  output: string;
}

function check(name: string, cmd: string, args: string[]): CheckResult {
  const res = spawnSync(cmd, args, { encoding: "utf8" });
  if (res.status === 0) {
    return {
      name,
      ok: true,
      output: (res.stdout || res.stderr || "ok").trim(),
    };
  }
  return {
    name,
    ok: false,
    output: (res.stderr || res.stdout || "missing").trim(),
  };
}

export async function runDoctor(): Promise<void> {
  const checks: CheckResult[] = [
    check("node", "node", ["-v"]),
    check("npm", "npm", ["-v"]),
    check("go", "go", ["version"]),
    check("java", "java", ["-version"]),
    check("python3", "python3", ["--version"]),
    check("git", "git", ["--version"]),
  ];

  let failed = 0;
  for (const item of checks) {
    if (!item.ok) failed += 1;
    const status = item.ok ? "OK" : "MISSING";
    console.log(`${status.padEnd(8)} ${item.name.padEnd(8)} ${item.output.split("\n")[0]}`);
  }

  if (failed > 0) {
    console.log(`doctor finished with ${failed} missing tools`);
  } else {
    console.log("doctor finished: all required tools found");
  }
}
