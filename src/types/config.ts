export const FRONTENDS = ["react", "vue", "none"] as const;
export const BACKENDS = ["go-gin", "springboot"] as const;
export const EXTRA_MODULES = [
  "python-worker",
  "worker-go",
  "gateway-bff",
  "python-ai",
  "grpc-service",
  "mq",
  "cache-redis",
  "observability",
  "auth-center",
] as const;
export const DATA_MODULES = ["mysql", "postgresql", "redis", "sqlite", "mongodb", "none"] as const;
export const PACKAGE_MANAGERS = ["pnpm", "npm", "yarn"] as const;

export type Frontend = (typeof FRONTENDS)[number];
export type BackendMain = (typeof BACKENDS)[number];
export type ExtraModule = (typeof EXTRA_MODULES)[number];
export type DataModule = (typeof DATA_MODULES)[number];
export type PackageManager = (typeof PACKAGE_MANAGERS)[number];

export interface CreateOptionsInput {
  frontend?: Frontend;
  backend?: BackendMain;
  modules?: string;
  data?: string;
  pm?: PackageManager;
  install?: boolean;
  git?: boolean;
  docker?: boolean;
  yes?: boolean;
  targetDir?: string;
}

export interface CreateConfig {
  projectName: string;
  frontend: Frontend;
  backendMain: BackendMain;
  extraModules: ExtraModule[];
  dataModules: DataModule[];
  packageManager: PackageManager;
  installDeps: boolean;
  initGit: boolean;
  docker: boolean;
  targetDir: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}
