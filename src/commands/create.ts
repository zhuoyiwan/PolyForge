import { resolveCreateConfig } from "../core/prompts";
import { renderProject } from "../core/renderer";
import { validateConfig } from "../core/validator";
import { maybeInstallDeps } from "../core/installer";
import { maybeInitGit } from "../core/git";
import type { CreateOptionsInput } from "../types/config";

export async function runCreate(projectName: string, options: CreateOptionsInput): Promise<void> {
  const config = await resolveCreateConfig(projectName, options);
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
