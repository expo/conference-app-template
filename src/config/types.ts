// Keep this file free of runtime imports: conference.config.ts is evaluated
// in Node when Expo reads app.config.ts, so only type imports are safe here.

/** A color, either a single value or a light/dark pair. */
export type ThemeColor = string | { light: string; dark: string };

export type DataSource =
  /** Fetch from the Sessionize "All" API view. */
  | { source: "sessionize"; sessionizeId: string }
  /** Fetch a JSON file that matches the Sessionize "All" shape. */
  | { source: "json"; url: string }
  /** Use only the bundled snapshot in src/data/allSessions.json. */
  | { source: "bundled" };

export type Sponsor = {
  name: string;
  /** Remote image URL. The image is cached on device by expo-image. */
  logo: string;
  url: string;
};

export type SponsorTier = {
  title: string;
  sponsors: Sponsor[];
};

export type InfoSection = {
  id: string;
  /** MaterialIcons icon name, e.g. "discord" or "live-tv". */
  icon?: string;
  title?: string;
  description: string;
  buttonTitle: string;
  url: string;
};

export type ConferenceConfig = {
  /** Full event name, e.g. "React Conf 2025". */
  name: string;
  /** Short name shown in the schedule header. Defaults to `name`. */
  shortName?: string;
  /** Project slug, also used to namespace on-device storage. */
  slug: string;
  /** Deep link scheme, e.g. "myconf". Lowercase letters only. */
  scheme: string;
  /** Bundle identifier prefix, e.g. "com.example.myconf". */
  appIdPrefix: string;
  version: string;
  /** IANA timezone of the venue, e.g. "Europe/Berlin". */
  timezone: string;
  /**
   * Short label for venue time shown in the timezone switch, e.g. "PDT".
   * Without it, the app shows a GMT offset such as "GMT-7".
   */
  timezoneAbbreviation?: string;
  /** Event website, appended to shared sessions. */
  website?: string;
  theme: {
    /** Accent color used for tabs, buttons, and highlights. */
    primary: ThemeColor;
    /** Splash screen background color. */
    splashBackground: string;
    /** Android adaptive icon background color. */
    androidIconBackground: string;
  };
  data: DataSource;
  venue?: {
    name: string;
    address: string;
    /** Defaults to a Google Maps search for name + address. */
    mapsUrl?: string;
  };
  /** Cards shown on the Info tab, e.g. livestream or community links. */
  infoSections: InfoSection[];
  /** Sponsor tiers shown on the Info tab. Empty array hides the section. */
  sponsorTiers: SponsorTier[];
  features: {
    /** Toggle between venue time and device time. */
    timezoneSwitch: boolean;
    /** "Currently live" indicator in the schedule header. */
    currentlyLive: boolean;
    /** Local notification before a bookmarked session starts. */
    sessionReminders: boolean;
  };
  /**
   * EAS project values. Leave undefined, then run `eas init` and
   * `eas update:configure` and copy the values here.
   */
  eas?: {
    projectId: string;
    owner: string;
    /** From `eas update:configure`. Leave unset to skip EAS Update. */
    updateUrl?: string;
  };
};
