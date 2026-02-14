#!/usr/bin/env node
import { execSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const root = process.cwd();
const out = fs.mkdtempSync(path.join(os.tmpdir(), "scaffold-smoke-"));
const project = "smoke-app";
const projectDir = path.join(out, project);

function run(command, cwd = root) {
  console.log(`$ ${command}`);
  execSync(command, { cwd, stdio: "inherit" });
}

try {
  run("npm run build");
  run(`node ${path.join(root, "dist/index.js")} create ${project} --yes --frontend react --backend go-gin --modules python-worker --data mysql,redis --docker --pm npm`, out);
  run("npm run check", projectDir);
  console.log(`\n[smoke] success: ${projectDir}`);
} catch (error) {
  console.error("\n[smoke] failed");
  throw error;
}
