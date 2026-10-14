import type { ConferenceConfig } from "../../src/config/types";

// Next.js Conf 2024 — a one-day, single-track conference.
// Data comes from the bundled data.json, synced into src/data/snapshot.json
// by the use-example script.

const config: ConferenceConfig = {
  name: "Next.js Conf 2024",
  shortName: "Next.js Conf",
  slug: "nextjs-conf-2024",
  scheme: "nextconf",
  appIdPrefix: "com.example.nextconf",
  version: "1.0.0",
  timezone: "America/Los_Angeles",
  website: "https://nextjs.org/conf",
  theme: {
    primary: { light: "#000000", dark: "#FFFFFF" },
    splashBackground: "#000000",
    androidIconBackground: "#000000",
    colors: {
      backgroundSecondary: { light: "#FAFAFA", dark: "#111111" },
      backgroundElement: { light: "#FAFAFA", dark: "#111111" },
    },
  },
  data: {
    source: "bundled",
  },
  venue: {
    name: "The Midway",
    address: "900 Marin Street, San Francisco, CA 94124",
  },
  infoSections: [
    {
      id: "website",
      title: "Next.js Conf",
      description:
        "A one-day conference by Vercel about Next.js and the web, live from San Francisco.",
      buttonTitle: "Visit website",
      url: "https://nextjs.org/conf",
    },
  ],
  sponsorTiers: [],
  features: {
    currentlyLive: true,
    sessionReminders: true,
  },
};

export default config;
