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
  if (targets.modules.includes("worker-go")) {
    advice.push(
      has(checks, "go")
        ? { label: "worker-go", status: "ok", detail: "Go toolchain detected for worker-go module." }
        : { label: "worker-go", status: "warn", detail: "Install Go 1.22+ for worker-go module." },
    );
  }
  if (targets.modules.includes("gateway-bff")) {
    advice.push(
      has(checks, "node") && has(checks, "npm")
        ? { label: "gateway-bff", status: "ok", detail: "Node.js and npm detected for gateway-bff." }
        : { label: "gateway-bff", status: "warn", detail: "Install Node.js 18+ and npm for gateway-bff module." },
    );
  }
  if (targets.modules.includes("python-ai")) {
    advice.push(
      has(checks, "python3")
        ? { label: "python-ai", status: "ok", detail: "Python detected for python-ai module." }
        : { label: "python-ai", status: "warn", detail: "Install Python 3.10+ for python-ai module." },
    );
  }
  if (targets.modules.includes("grpc-service")) {
    advice.push(
      has(checks, "protoc")
        ? { label: "grpc-service", status: "ok", detail: "protoc detected for gRPC contract generation." }
        : { label: "grpc-service", status: "warn", detail: "Install protoc for gRPC code generation." },
    );
  }
  if (targets.modules.includes("mq")) {
    advice.push(
      has(checks, "docker")
        ? { label: "mq", status: "ok", detail: "Docker detected for local MQ brokers." }
        : { label: "mq", status: "warn", detail: "Install Docker to run Kafka/RabbitMQ/NATS locally." },
    );
  }
  if (targets.modules.includes("cache-redis")) {
    advice.push(
      has(checks, "docker")
        ? { label: "cache-redis", status: "ok", detail: "Docker detected for local Redis cache service." }
        : { label: "cache-redis", status: "warn", detail: "Install Docker or run Redis manually." },
    );
  }
  if (targets.modules.includes("observability")) {
    advice.push(
      has(checks, "docker")
        ? { label: "observability", status: "ok", detail: "Docker detected for Prometheus/Grafana stack." }
        : { label: "observability", status: "warn", detail: "Install Docker for local observability stack." },
    );
  }
  if (targets.modules.includes("auth-center")) {
    advice.push({
      label: "auth-center",
      status: "ok",
      detail: "Remember to configure JWT secrets and OAuth clients before production.",
    });
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
    check("protoc", "protoc", ["--version"]),
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
