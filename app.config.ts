// Lets this file import conference.config.ts: Expo only transpiles
// app.config.ts itself, nested imports go through plain Node require.
import "sucrase/register/ts";

import { ExpoConfig } from "expo/config";

import conference from "./conference.config";

const IS_DEV = process.env.APP_VARIANT === "development";
const IS_PREVIEW = process.env.APP_VARIANT === "preview";

const getName = () => {
  if (IS_DEV) {
    return `${conference.name} (Dev)`;
  }

  if (IS_PREVIEW) {
    return `${conference.name} (Prev)`;
  }

  return conference.name;
};

const getAppId = () => {
  if (IS_DEV) {
    return `${conference.appIdPrefix}.dev`;
  }

  if (IS_PREVIEW) {
    return `${conference.appIdPrefix}.preview`;
  }

  return `${conference.appIdPrefix}.app`;
};

const config: ExpoConfig = {
  name: getName(),
  slug: conference.slug,
  version: conference.version,
  orientation: "portrait",
  icon: "./assets/brand/icon.png",
  userInterfaceStyle: "automatic",
  scheme: conference.scheme,
  assetBundlePatterns: ["**/*"],
  newArchEnabled: true,
  ios: {
    supportsTablet: true,
    bundleIdentifier: getAppId(),
    userInterfaceStyle: "automatic",
    config: {
      usesNonExemptEncryption: false,
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/brand/adaptive-icon.png",
      monochromeImage: "./assets/brand/adaptive-icon-monochrome.png",
      backgroundColor: conference.theme.androidIconBackground,
    },
    userInterfaceStyle: "automatic",
    package: getAppId(),
    edgeToEdgeEnabled: true,
    softwareKeyboardLayoutMode: "pan",
  },
  web: {
    favicon: "./assets/brand/favicon.png",
  },
  ...(conference.eas
    ? {
        extra: {
          eas: {
            projectId: conference.eas.projectId,
          },
        },
        owner: conference.eas.owner,
        ...(conference.eas.updateUrl
          ? {
              updates: {
                url: conference.eas.updateUrl,
                requestHeaders: {
                  "expo-channel-name": "local",
                },
              },
            }
          : {}),
      }
    : {}),
  plugins: [
    "expo-asset",
    [
      "expo-build-properties",
      {
        android: {
          reactNativeReleaseLevel: "experimental",
        },
        ios: {
          reactNativeReleaseLevel: "experimental",
        },
      },
    ],
    "expo-web-browser",
    "expo-router",
    [
      "expo-calendar",
      {
        calendarPermission:
          "Allow $(PRODUCT_NAME) to add sessions to your calendar.",
      },
    ],
    [
      "expo-font",
      {
        fonts: [
          "./assets/fonts/Montserrat-Light.ttf",
          "./assets/fonts/Montserrat-LightItalic.ttf",

          "./assets/fonts/Montserrat-Medium.ttf",
          "./assets/fonts/Montserrat-MediumItalic.ttf",

          "./assets/fonts/Montserrat-Bold.ttf",
          "./assets/fonts/Montserrat-BoldItalic.ttf",

          "./assets/fonts/Montserrat-SemiBold.ttf",
          "./assets/fonts/Montserrat-SemiBoldItalic.ttf",
        ],
      },
    ],
    [
      "expo-splash-screen",
      {
        backgroundColor: conference.theme.splashBackground,
        image: "./assets/brand/splash-icon.png",
        imageWidth: 190,
      },
    ],
    [
      "@zoontek/react-native-navigation-bar",
      {
        android: {
          enforceNavigationBarContrast: false,
        },
      },
    ],
  ],
  runtimeVersion: {
    policy: "appVersion",
  },
  experiments: {
    reactCompiler: true,
  },
};

export default config;
