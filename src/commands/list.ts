import { BACKENDS, DATA_MODULES, EXTRA_MODULES, FRONTENDS, PACKAGE_MANAGERS } from "../types/config";
import { DEFAULTS } from "../core/validator";

function join(items: readonly string[]): string {
  return items.join(", ");
}

export async function runList(): Promise<void> {
  console.log("PolyForge Scaffold Options");
  console.log("");
  console.log(`frontend: ${join(FRONTENDS)}`);
  console.log(`backend: ${join(BACKENDS)}`);
  console.log(`modules: ${join(EXTRA_MODULES)}`);
  console.log(`data: ${join(DATA_MODULES)}`);
  console.log(`packageManager: ${join(PACKAGE_MANAGERS)}`);
  console.log("");
  console.log("Defaults (--yes):");
  console.log(`- frontend=${DEFAULTS.frontend}`);
  console.log(`- backend=${DEFAULTS.backendMain}`);
  console.log(`- modules=${DEFAULTS.extraModules.join(",") || "none"}`);
  console.log(`- data=${DEFAULTS.dataModules.join(",")}`);
  console.log(`- pm=${DEFAULTS.packageManager}`);
  console.log(`- install=${String(DEFAULTS.installDeps)}`);
  console.log(`- git=${String(DEFAULTS.initGit)}`);
  console.log(`- docker=${String(DEFAULTS.docker)}`);
  console.log("");
  console.log("Rules:");
  console.log("- data=none is mutually exclusive with other data modules");
  console.log("- data modules can be combined (example: mysql,redis)");
  console.log("- backend main stack is limited to go-gin and springboot");
}
