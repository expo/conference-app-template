// Applies an example conference to the project:
//   bun run use-example appjs-conf-2025
//
// Copies the example config to ./conference.config.ts, installs its data
// snapshot, and regenerates the placeholder brand assets in its color.
// Run with no argument to list the available examples.

import { cp, readdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";

const examplesDir = "./examples";
const name = process.argv[2];

const available = (await readdir(examplesDir, { withFileTypes: true }))
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name);

if (!name || !available.includes(name)) {
  if (name) {
    console.error(`❌ unknown example "${name}"`);
  }
  console.info(`Usage: bun run use-example <name>\n`);
  console.info(`Available examples:\n${available.map((n) => `  - ${n}`).join("\n")}`);
  process.exit(name ? 1 : 0);
}

const dir = `${examplesDir}/${name}`;

// 1. Config: fix the type import path for the repo root, then write it.
const config = await readFile(`${dir}/conference.config.ts`, "utf8");
await writeFile(
  "./conference.config.ts",
  config.replace("../../src/config/types", "./src/config/types"),
);
console.info("✅ wrote conference.config.ts");

// 2. Data snapshot: bundled data.json wins, else fetch via the adapter.
if (existsSync(`${dir}/data.json`)) {
  await cp(`${dir}/data.json`, "./src/data/snapshot.json");
  console.info("✅ wrote src/data/snapshot.json from data.json");
} else {
  const sync = spawnSync("bun", ["./scripts/syncData.ts"], {
    stdio: "inherit",
  });
  if (sync.status !== 0) {
    console.warn("⚠️ sync failed, the previous snapshot stays in place");
  }
}

// 3. Brand assets in the example's primary color.
const { default: conference } = await import(`.${dir}/conference.config.ts`);
const primary =
  typeof conference.theme.primary === "string"
    ? conference.theme.primary
    : conference.theme.primary.light;
spawnSync(
  "node",
  ["./scripts/generateBrandAssets.mjs", "--force", "--color", primary],
  { stdio: "inherit" },
);

console.info(`\n🎉 now running "${conference.name}" — start with: bun run ios`);
