import type { ConferenceConfig } from "../../src/config/types";

// App.js Conf 2025 — a three-day conference (workshops + two talk days).
// Data comes from the bundled data.json, synced into src/data/snapshot.json
// by the use-example script.

const config: ConferenceConfig = {
  name: "App.js Conf 2025",
  shortName: "App.js Conf",
  slug: "appjs-conf-2025",
  scheme: "appjsconf",
  appIdPrefix: "com.example.appjsconf",
  version: "1.0.0",
  timezone: "Europe/Warsaw",
  website: "https://appjs.co",
  theme: {
    primary: { light: "#0033CC", dark: "#6688FF" },
    splashBackground: "#001A66",
    androidIconBackground: "#0033CC",
  },
  data: {
    source: "bundled",
  },
  venue: {
    name: "Stara Zajezdnia Kraków by DeSilva",
    address: "Świętego Wawrzyńca 12, 31-060 Kraków, Poland",
  },
  infoSections: [
    {
      id: "website",
      title: "App.js Conf",
      description:
        "The Expo and React Native conference in Europe. Three days of workshops and talks in Kraków.",
      buttonTitle: "Visit website",
      url: "https://appjs.co",
    },
  ],
  sponsorTiers: [],
  features: {
    currentlyLive: true,
    sessionReminders: true,
  },
};

export default config;
