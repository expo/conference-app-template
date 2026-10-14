import type { ConferenceConfig } from "./src/config/types";

// This file is the single source of truth for your conference.
// Edit the values below and replace the images in assets/brand/.
//
// Everything here is fictional sample content so the app runs out of the
// box. See examples/ for configs filled with real conference data.

const config: ConferenceConfig = {
  name: "My Conference",
  shortName: "My Conf",
  slug: "my-conference",
  scheme: "myconference",
  appIdPrefix: "com.example.myconference",
  version: "1.0.0",
  timezone: "America/Los_Angeles",
  website: "https://example.com",
  theme: {
    primary: { light: "#087EA4", dark: "#58C4DC" },
    splashBackground: "#23272F",
    androidIconBackground: "#087EA4",
  },
  // Point this at your own schedule:
  //   { source: "sessionize", sessionizeId: "your-api-id" }
  //   { source: "json", url: "https://example.com/schedule.json" }
  // With "bundled", the app only uses src/data/snapshot.json.
  data: {
    source: "bundled",
  },
  venue: {
    name: "Harborview Conference Center",
    address: "500 Seaside Avenue, San Francisco, CA 94111",
  },
  infoSections: [
    {
      id: "livestream",
      title: "Live Stream",
      description:
        "Join from anywhere with our free live stream. Watch all the talks remotely.",
      buttonTitle: "Sign up",
      url: "https://example.com/livestream",
    },
    {
      id: "community",
      icon: "forum",
      description:
        "Chat with other attendees before, during, and after the conference in our community space.",
      buttonTitle: "Join the community",
      url: "https://example.com/community",
    },
  ],
  sponsorTiers: [],
  features: {
    currentlyLive: true,
    sessionReminders: true,
  },
  // To use EAS Build and Update, run `eas init` and add the values here:
  // eas: { projectId: "...", owner: "..." },
};

export default config;
