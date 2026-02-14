#!/usr/bin/env node
import { Command } from "commander";
import { runCreate } from "./commands/create";
import { runDoctor } from "./commands/doctor";

const program = new Command();

program.name("scaffold").description("Hybrid full-stack scaffold CLI").version("0.1.0");

program
  .command("create")
  .argument("<project-name>", "project name")
  .option("--frontend <frontend>", "react|vue|none")
  .option("--backend <backend>", "go-gin|springboot")
  .option("--modules <modules>", "comma separated modules, e.g. python-worker")
  .option("--data <data>", "comma separated data modules")
  .option("--pm <pm>", "pnpm|npm|yarn")
  .option("--install", "install dependencies")
  .option("--git", "initialize git")
  .option("--docker", "generate docker baseline")
  .option("--yes", "use defaults for missing options")
  .action(async (projectName, options) => {
    try {
      await runCreate(projectName, options);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(message);
      process.exit(1);
    }
  });

program
  .command("doctor")
  .description("check local toolchain")
  .option("--backend <backend>", "target backend for focused diagnostics: go-gin|springboot")
  .option("--modules <modules>", "target extra modules, e.g. python-worker")
  .option("--data <data>", "target data modules, e.g. mysql,redis")
  .action(async (options) => {
    await runDoctor(options);
  });

program.parseAsync(process.argv);
