import {
  BACKENDS,
  DATA_MODULES,
  EXTRA_MODULES,
  FRONTENDS,
  PACKAGE_MANAGERS,
  type CreateConfig,
  type DataModule,
  type ValidationResult,
} from "../types/config";

export const DEFAULTS: Omit<CreateConfig, "projectName" | "targetDir"> = {
  frontend: "react",
  backendMain: "go-gin",
  extraModules: [],
  dataModules: ["none"],
  packageManager: "npm",
  installDeps: false,
  initGit: false,
  docker: false,
};

export function parseCsv(input?: string): string[] {
  if (!input) return [];
  return input
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
}

export function unique<T>(arr: T[]): T[] {
  return [...new Set(arr)];
}

export function parseDataModules(input?: string): DataModule[] {
  const parsed = parseCsv(input);
  return parsed.filter((x): x is DataModule => DATA_MODULES.includes(x as DataModule));
}

export function parseExtraModules(input?: string) {
  const parsed = parseCsv(input);
  return parsed.filter((x): x is (typeof EXTRA_MODULES)[number] => EXTRA_MODULES.includes(x as (typeof EXTRA_MODULES)[number]));
}

export function validateConfig(config: CreateConfig): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!config.projectName.trim()) {
    errors.push("projectName is required");
  }

  if (!FRONTENDS.includes(config.frontend)) {
    errors.push(`unsupported frontend: ${config.frontend}`);
  }
  if (!BACKENDS.includes(config.backendMain)) {
    errors.push(`unsupported backend: ${config.backendMain}`);
  }
  if (!PACKAGE_MANAGERS.includes(config.packageManager)) {
    errors.push(`unsupported package manager: ${config.packageManager}`);
  }

  const uniqueData = unique(config.dataModules);
  if (uniqueData.length !== config.dataModules.length) {
    errors.push("data modules contain duplicates");
  }
  const uniqueModules = unique(config.extraModules);
  if (uniqueModules.length !== config.extraModules.length) {
    errors.push("extra modules contain duplicates");
  }

  const hasNone = config.dataModules.includes("none");
  if (hasNone && config.dataModules.length > 1) {
    errors.push("data=none cannot be combined with other data modules");
  }

  if (config.backendMain === "springboot" && config.dataModules.includes("sqlite")) {
    warnings.push("springboot + sqlite is better for lightweight local scenarios");
  }

  if (config.extraModules.includes("python-worker")) {
    warnings.push("python-worker selected: ensure Python 3.10+ and venv tooling are available");
  }
  if (config.extraModules.includes("python-ai")) {
    warnings.push("python-ai selected: ensure Python 3.10+ and model runtime dependencies are available");
  }
  if (config.extraModules.includes("grpc-service")) {
    warnings.push("grpc-service selected: install protoc and language plugins for code generation");
  }
  if (config.extraModules.includes("mq")) {
    warnings.push("mq selected: verify local broker runtime (Kafka/RabbitMQ/NATS) for integration testing");
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}
