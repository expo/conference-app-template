import type { ConferenceConfig } from "./src/config/types";

// This file is the single source of truth for your conference.
// Edit the values below and replace the images in assets/brand/.
// The sample values point at React Conf 2025 public data so the
// app runs out of the box.

const config: ConferenceConfig = {
  name: "My Conference",
  shortName: "My Conf",
  slug: "my-conference",
  scheme: "myconference",
  appIdPrefix: "com.example.myconference",
  version: "1.0.0",
  timezone: "America/Los_Angeles",
  website: "https://conf.react.dev",
  theme: {
    primary: { light: "#087EA4", dark: "#58C4DC" },
    splashBackground: "#23272F",
    androidIconBackground: "#087EA4",
  },
  data: {
    source: "sessionize",
    sessionizeId: "7l5wob2t",
  },
  venue: {
    name: "The Westin Lake Las Vegas Resort & Spa",
    address: "101 Montelago Blvd, Henderson, NV 89011",
  },
  infoSections: [
    {
      id: "livestream",
      title: "Live Stream",
      description:
        "Join from anywhere with our free live stream. Watch all the talks remotely.",
      buttonTitle: "Sign up",
      url: "https://conf.react.dev/#newsletter",
    },
    {
      id: "community",
      icon: "discord",
      description:
        "Chat with other folks at the conference via the dedicated Discord server.",
      buttonTitle: "Join us on Discord",
      url: "https://discord.gg/reactconf",
    },
  ],
  sponsorTiers: [],
  features: {
    timezoneSwitch: true,
    currentlyLive: true,
    sessionReminders: true,
  },
};

export default config;
