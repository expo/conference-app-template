// Writes a fresh data snapshot to src/data/allSessions.json so the app
// works offline on first launch. Run with: npm run sync-data (or bun run).
// Requires Node 22.18+ (built-in TypeScript type stripping) or Bun.

import { writeFile } from "node:fs/promises";

import conference from "../conference.config";

const getDataUrl = () => {
  switch (conference.data.source) {
    case "sessionize":
      return `https://sessionize.com/api/v2/${conference.data.sessionizeId}/view/All`;
    case "json":
      return conference.data.url;
    case "bundled":
      return null;
  }
};

const filePath = "./src/data/allSessions.json";

(async () => {
  const url = getDataUrl();

  if (!url) {
    console.info("ℹ️ data.source is 'bundled', nothing to sync");
    return;
  }

  const result = await fetch(url);
  if (!result.ok) {
    console.error(`❌ ${url} responded with ${result.status}`);
    process.exit(1);
  }
  const data = await result.json();

  await writeFile(filePath, JSON.stringify(data, null, "  "));
  console.info(`✅ ${filePath} updated from ${url}`);
})();
