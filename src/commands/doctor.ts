import { spawnSync } from "child_process";
import { BACKENDS, DATA_MODULES, EXTRA_MODULES, type BackendMain, type DataModule, type ExtraModule } from "../types/config";
import { parseCsv } from "../core/validator";

interface CheckResult {
  name: string;
  ok: boolean;
  output: string;
}

export interface DoctorOptions {
  backend?: BackendMain;
  modules?: string;
  data?: string;
}

export interface DoctorAdvice {
  label: string;
  status: "ok" | "warn";
  detail: string;
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

function parseTargets(options: DoctorOptions) {
  const backend = options.backend && BACKENDS.includes(options.backend) ? options.backend : undefined;
  const modules = parseCsv(options.modules).filter((item): item is ExtraModule => EXTRA_MODULES.includes(item as ExtraModule));
  const data = parseCsv(options.data).filter((item): item is DataModule => DATA_MODULES.includes(item as DataModule));
  return { backend, modules, data };
}

function has(checks: Record<string, CheckResult>, name: string): boolean {
  return checks[name]?.ok ?? false;
}

export function buildDoctorAdvice(checks: Record<string, CheckResult>, options: DoctorOptions): DoctorAdvice[] {
  const targets = parseTargets(options);
  const advice: DoctorAdvice[] = [];

  if (targets.backend === "go-gin") {
    advice.push(
      has(checks, "go")
        ? { label: "go-gin", status: "ok", detail: "Go toolchain detected." }
        : { label: "go-gin", status: "warn", detail: "Install Go 1.22+ for go-gin templates." },
    );
  }

  if (targets.backend === "springboot") {
    advice.push(
      has(checks, "java")
        ? { label: "springboot", status: "ok", detail: "Java runtime detected." }
        : { label: "springboot", status: "warn", detail: "Install JDK 17+ for Spring Boot templates." },
    );
    advice.push(
      has(checks, "mvn")
        ? { label: "maven", status: "ok", detail: "Maven detected." }
        : { label: "maven", status: "warn", detail: "Install Maven 3.9+ to run spring build/test." },
    );
  }

  if (targets.modules.includes("python-worker")) {
    advice.push(
      has(checks, "python3")
        ? { label: "python-worker", status: "ok", detail: "Python 3 runtime detected." }
        : { label: "python-worker", status: "warn", detail: "Install Python 3.10+ for worker module." },
    );
  }

  if (targets.data.some((item) => item !== "none")) {
    advice.push(
      has(checks, "docker")
        ? { label: "data-services", status: "ok", detail: "Docker detected for local DB/cache containers." }
        : { label: "data-services", status: "warn", detail: "Docker not found; run data services manually or install Docker Desktop." },
    );
  }

  return advice;
}

export async function runDoctor(options: DoctorOptions = {}): Promise<void> {
  const checksList: CheckResult[] = [
    check("node", "node", ["-v"]),
    check("npm", "npm", ["-v"]),
    check("go", "go", ["version"]),
    check("java", "java", ["-version"]),
    check("mvn", "mvn", ["-v"]),
    check("python3", "python3", ["--version"]),
    check("git", "git", ["--version"]),
    check("docker", "docker", ["--version"]),
  ];

  const checks = Object.fromEntries(checksList.map((item) => [item.name, item])) as Record<string, CheckResult>;

  let failed = 0;
  for (const item of checksList) {
    if (!item.ok) failed += 1;
    const status = item.ok ? "OK" : "MISSING";
    console.log(`${status.padEnd(8)} ${item.name.padEnd(8)} ${item.output.split("\n")[0]}`);
  }

  const advices = buildDoctorAdvice(checks, options);
  if (advices.length > 0) {
    console.log("\nTargeted Advice:");
    for (const advice of advices) {
      const tag = advice.status === "ok" ? "OK" : "WARN";
      console.log(`- ${tag} ${advice.label}: ${advice.detail}`);
    }
  }

  if (failed > 0) {
    console.log(`\ndoctor finished with ${failed} missing tools`);
  } else {
    console.log("\ndoctor finished: all required tools found");
  }
}
