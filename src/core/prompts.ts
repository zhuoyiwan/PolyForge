import path from "path";
import prompts from "prompts";
import {
  DATA_MODULES,
  EXTRA_MODULES,
  type CreateConfig,
  type CreateOptionsInput,
  type Frontend,
  type BackendMain,
  type PackageManager,
  type DataModule,
  type ExtraModule,
} from "../types/config";
import { DEFAULTS, parseCsv, parseDataModules, parseExtraModules } from "./validator";

interface PromptResult {
  frontend?: Frontend;
  backendMain?: BackendMain;
  extraModules?: ExtraModule[];
  dataModules?: DataModule[];
  packageManager?: PackageManager;
  installDeps?: boolean;
  initGit?: boolean;
  docker?: boolean;
}

export async function resolveCreateConfig(
  projectName: string,
  options: CreateOptionsInput,
): Promise<CreateConfig> {
  const targetDir = path.resolve(options.targetDir ?? process.cwd(), projectName);
  const rawModuleInputs = parseCsv(options.modules);
  const rawDataInputs = parseCsv(options.data);
  const invalidModules = rawModuleInputs.filter((item) => !EXTRA_MODULES.includes(item as ExtraModule));
  const invalidDataModules = rawDataInputs.filter((item) => !DATA_MODULES.includes(item as DataModule));
  if (invalidModules.length > 0) {
    throw new Error(`unsupported modules: ${invalidModules.join(", ")}`);
  }
  if (invalidDataModules.length > 0) {
    throw new Error(`unsupported data modules: ${invalidDataModules.join(", ")}`);
  }

  const cliModules = parseExtraModules(options.modules);
  const cliDataModules = parseDataModules(options.data);

  const initial: Partial<CreateConfig> = {
    projectName,
    frontend: options.frontend,
    backendMain: options.backend,
    extraModules: cliModules.length > 0 ? cliModules : undefined,
    dataModules: cliDataModules.length > 0 ? cliDataModules : undefined,
    packageManager: options.pm,
    installDeps: options.install,
    initGit: options.git,
    docker: options.docker,
    targetDir,
  };

  let prompted: PromptResult = {};
  if (!options.yes) {
    prompted = await askMissing(initial);
  }

  return {
    projectName,
    targetDir,
    frontend: initial.frontend ?? prompted.frontend ?? DEFAULTS.frontend,
    backendMain: initial.backendMain ?? prompted.backendMain ?? DEFAULTS.backendMain,
    extraModules: initial.extraModules ?? prompted.extraModules ?? DEFAULTS.extraModules,
    dataModules: initial.dataModules ?? prompted.dataModules ?? DEFAULTS.dataModules,
    packageManager: initial.packageManager ?? prompted.packageManager ?? DEFAULTS.packageManager,
    installDeps: initial.installDeps ?? prompted.installDeps ?? DEFAULTS.installDeps,
    initGit: initial.initGit ?? prompted.initGit ?? DEFAULTS.initGit,
    docker: initial.docker ?? prompted.docker ?? DEFAULTS.docker,
  };
}

async function askMissing(initial: Partial<CreateConfig>): Promise<PromptResult> {
  const res = await prompts([
    {
      type: initial.frontend ? null : "select",
      name: "frontend",
      message: "Select frontend",
      choices: [
        { title: "react", value: "react" },
        { title: "vue", value: "vue" },
        { title: "none", value: "none" },
      ],
      initial: 0,
    },
    {
      type: initial.backendMain ? null : "select",
      name: "backendMain",
      message: "Select backend",
      choices: [
        { title: "go-gin", value: "go-gin" },
        { title: "springboot", value: "springboot" },
      ],
      initial: 0,
    },
    {
      type: initial.extraModules ? null : "multiselect",
      name: "extraModules",
      message: "Select extra modules",
      choices: [
        { title: "python-worker", value: "python-worker" },
        { title: "worker-go", value: "worker-go" },
        { title: "gateway-bff", value: "gateway-bff" },
        { title: "python-ai", value: "python-ai" },
        { title: "grpc-service", value: "grpc-service" },
        { title: "mq", value: "mq" },
        { title: "cache-redis", value: "cache-redis" },
        { title: "observability", value: "observability" },
        { title: "auth-center", value: "auth-center" },
      ],
      hint: "Space to select",
      min: 0,
    },
    {
      type: initial.dataModules ? null : "multiselect",
      name: "dataModules",
      message: "Select data modules",
      choices: [
        { title: "mysql", value: "mysql" },
        { title: "postgresql", value: "postgresql" },
        { title: "redis", value: "redis" },
        { title: "sqlite", value: "sqlite" },
        { title: "mongodb", value: "mongodb" },
        { title: "none", value: "none" },
      ],
      min: 1,
      hint: "none cannot combine with others",
    },
    {
      type: initial.packageManager ? null : "select",
      name: "packageManager",
      message: "Select package manager",
      choices: [
        { title: "pnpm", value: "pnpm" },
        { title: "npm", value: "npm" },
        { title: "yarn", value: "yarn" },
      ],
      initial: 1,
    },
    {
      type: initial.installDeps !== undefined ? null : "toggle",
      name: "installDeps",
      message: "Install dependencies now?",
      initial: false,
      active: "yes",
      inactive: "no",
    },
    {
      type: initial.initGit !== undefined ? null : "toggle",
      name: "initGit",
      message: "Initialize git?",
      initial: false,
      active: "yes",
      inactive: "no",
    },
    {
      type: initial.docker !== undefined ? null : "toggle",
      name: "docker",
      message: "Generate docker baseline config?",
      initial: false,
      active: "yes",
      inactive: "no",
    },
  ]);

  return res;
}
