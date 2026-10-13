// Writes a fresh, normalized data snapshot to src/data/snapshot.json so the
// app works offline on first launch. Run with: bun run sync-data

import { writeFile } from "node:fs/promises";

import conference from "../conference.config";
import { getAdapter } from "../src/data/adapters";

const filePath = "./src/data/snapshot.json";

(async () => {
  const adapter = getAdapter(conference.data);

  if (!adapter.fetchAll) {
    console.info("ℹ️ data.source is 'bundled', nothing to sync");
    return;
  }

  const data = await adapter.fetchAll();

  if (!data) {
    console.error("❌ could not fetch or validate the data source");
    process.exit(1);
  }

  await writeFile(filePath, JSON.stringify(data, null, "  "));
  console.info(
    `✅ ${filePath} updated (${data.sessions.length} sessions, ${data.speakers.length} speakers)`,
  );
})();
