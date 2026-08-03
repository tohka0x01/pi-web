import { readdirSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const ignoredDirectories = new Set([".git", ".next", "node_modules"]);

function collectTests(directory) {
  const tests = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!ignoredDirectories.has(entry.name)) tests.push(...collectTests(join(directory, entry.name)));
      continue;
    }
    if (entry.name.endsWith(".test.mjs")) tests.push(join(directory, entry.name));
  }
  return tests;
}

const result = spawnSync(
  process.execPath,
  ["--test", "--test-concurrency=1", ...collectTests(process.cwd())],
  { stdio: "inherit" },
);

if (result.error) throw result.error;
process.exit(result.status ?? 1);
