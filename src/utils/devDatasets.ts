// Dev-only dataset switcher. Adds "Dataset: …" entries to the Expo dev menu
// (shake the device or press Cmd+D / Ctrl+M) that load the bundled example
// schedules at runtime: data, venue timezone, and header name. Build-time
// branding (icon, splash, colors) stays with conference.config.ts.
//
// Only import this module behind an `if (__DEV__)` guard — that keeps the
// example data and expo-dev-menu out of production bundles.

import { registerDevMenuItems } from "expo-dev-menu";

import { NormalizedData } from "@/data/schema";
import { DevDataset, useConferenceStore } from "@/store/conferenceStore";

export const devDatasets: DevDataset[] = [
  {
    id: "nextjs-conf-2024",
    name: "Next.js Conf 2024",
    timezone: "America/Los_Angeles",
    timezoneAbbreviation: "PDT",
    data: require("../../examples/nextjs-conf-2024/data.json") as NormalizedData,
  },
  {
    id: "appjs-conf-2025",
    name: "App.js Conf 2025",
    timezone: "Europe/Warsaw",
    timezoneAbbreviation: "CEST",
    data: require("../../examples/appjs-conf-2025/data.json") as NormalizedData,
  },
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
