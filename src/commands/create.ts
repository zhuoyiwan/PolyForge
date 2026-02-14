import { resolveCreateConfig } from "../core/prompts";
import { renderProject } from "../core/renderer";
import { validateConfig } from "../core/validator";
import { maybeInstallDeps } from "../core/installer";
import { maybeInitGit } from "../core/git";
import type { CreateOptionsInput } from "../types/config";

function printResolvedConfigSummary(options: CreateOptionsInput, config: Awaited<ReturnType<typeof resolveCreateConfig>>) {
  const defaulted: string[] = [];
  if (options.frontend === undefined) defaulted.push(`frontend=${config.frontend}`);
  if (options.backend === undefined) defaulted.push(`backend=${config.backendMain}`);
  if (options.modules === undefined) defaulted.push(`modules=${config.extraModules.join(",") || "none"}`);
  if (options.data === undefined) defaulted.push(`data=${config.dataModules.join(",")}`);
  if (options.pm === undefined) defaulted.push(`pm=${config.packageManager}`);
  if (options.install === undefined) defaulted.push(`install=${String(config.installDeps)}`);
  if (options.git === undefined) defaulted.push(`git=${String(config.initGit)}`);
  if (options.docker === undefined) defaulted.push(`docker=${String(config.docker)}`);

  if (options.yes && defaulted.length > 0) {
    console.log(`[scaffold] --yes defaults applied: ${defaulted.join(" | ")}`);
  }
}

export async function runCreate(projectName: string, options: CreateOptionsInput): Promise<void> {
  const config = await resolveCreateConfig(projectName, options);
  printResolvedConfigSummary(options, config);
  const validation = validateConfig(config);

  if (!validation.valid) {
    throw new Error(`Invalid configuration:\n- ${validation.errors.join("\n- ")}`);
  }

  for (const warning of validation.warnings) {
    console.warn(`[warning] ${warning}`);
  }

  await renderProject(config);
  await maybeInstallDeps(config);
  await maybeInitGit(config);

  console.log(`[scaffold] project created: ${config.targetDir}`);
  console.log("[scaffold] next: cd <project> && npm run check && npm run dev");
}
