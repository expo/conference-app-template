// Dev-only dataset switcher. Adds "Dataset: …" entries to the Expo dev menu
// (shake the device or press Cmd+D / Ctrl+M) that load the bundled example
// conferences at runtime: schedule, speakers, venue, info sections, sponsors,
// and timezone. Build-time branding (icon, splash, colors) stays with
// conference.config.ts.
//
// Only import this module behind an `if (__DEV__)` guard — that keeps the
// example data and expo-dev-menu out of production bundles.

import { registerDevMenuItems } from "expo-dev-menu";

import type { ConferenceConfig } from "@/config/types";
import { NormalizedData } from "@/data/schema";
import { DevDataset, useConferenceStore } from "@/store/conferenceStore";
import appjsConfig from "../../examples/appjs-conf-2025/conference.config";
import nextjsConfig from "../../examples/nextjs-conf-2024/conference.config";

const toDataset = (
  config: ConferenceConfig,
  data: NormalizedData,
): DevDataset => ({
  id: config.slug,
  name: config.shortName ?? config.name,
  timezone: config.timezone,
  venue: config.venue,
  infoSections: config.infoSections,
  sponsorTiers: config.sponsorTiers,
  data,
});

export const devDatasets: DevDataset[] = [
  toDataset(
    nextjsConfig,
    require("../../examples/nextjs-conf-2024/data.json") as NormalizedData,
  ),
  toDataset(
    appjsConfig,
    require("../../examples/appjs-conf-2025/data.json") as NormalizedData,
  ),
];

export const setupDevMenu = () => {
  registerDevMenuItems([
    ...devDatasets.map((dataset) => ({
      name: `Dataset: ${dataset.name} (${formatDayCount(dataset)})`,
      callback: () => {
        useConferenceStore.getState().loadDevDataset(dataset);
      },
      shouldCollapse: true,
    })),
    {
      name: "Dataset: reset to configured data",
      callback: () => {
        useConferenceStore.getState().loadDevDataset(null);
      },
      shouldCollapse: true,
    },
  ]);
};

const formatDayCount = (dataset: DevDataset) => {
  const count = new Set(
    dataset.data.sessions.map((session) => session.startsAt.slice(0, 10)),
  ).size;
  return count === 1 ? "1 day" : `${count} days`;
};
