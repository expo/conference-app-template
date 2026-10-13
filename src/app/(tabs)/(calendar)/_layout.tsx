import { ThemedText, useThemeColor } from "@/components/Themed";
import { TimeZoneSwitch } from "@/components/TimeZoneSwitch";
import { theme } from "@/theme";
import { isLiquidGlassAvailable } from "expo-glass-effect";
import { Stack } from "expo-router";
import { Platform } from "react-native";
import conference from "../../../../conference.config";

export default function Layout() {
  const tabBarBackgroundColor = useThemeColor(theme.color.background);
  return (
    <Stack
      screenOptions={{
        headerLargeTitle: true,
        headerLargeTitleShadowVisible: false,
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: Platform.OS === "ios" ? "Calendar" : "",
          headerStyle: {
            backgroundColor: isLiquidGlassAvailable()
              ? "transparent"
              : tabBarBackgroundColor,
          },
          headerLeft: () => (
            <ThemedText fontSize={theme.fontSize14} fontWeight="bold">
              {conference.shortName ?? conference.name}
            </ThemedText>
          ),
          headerRight: () =>
            conference.features.timezoneSwitch ? <TimeZoneSwitch /> : null,
        }}
      />
    </Stack>
  );
}
