import { ThemedText, useThemeColor } from "@/components/Themed";
import { theme } from "@/theme";
import { isLiquidGlassAvailable } from "expo-glass-effect";
import { Stack, useRouter } from "expo-router";
import { Platform } from "react-native";
import { useConferenceStore } from "@/store/conferenceStore";

export default function Layout() {
  const router = useRouter();
  const displayName = useConferenceStore((state) => state.displayName);
  const tabBarBackgroundColor = useThemeColor(theme.color.background);
  const tabBarTintColor = useThemeColor({
    light: theme.colorBlack,
    dark: theme.colorWhite,
  });
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
              {displayName}
            </ThemedText>
          ),
          // iOS 26 wraps custom header items in a shared glass background.
          // Opt the plain text out of it.
          unstable_headerLeftItems: () => [
            {
              type: "custom",
              element: (
                <ThemedText fontSize={theme.fontSize14} fontWeight="bold">
                  {displayName}
                </ThemedText>
              ),
              hidesSharedBackground: true,
            },
          ],
          headerSearchBarOptions: {
            headerIconColor: tabBarTintColor,
            tintColor: tabBarTintColor,
            textColor: tabBarTintColor,
            hintTextColor: tabBarTintColor,
            placeholder: "Search sessions",
            onChangeText: (event) => {
              router.setParams({
                q: event.nativeEvent.text,
              });
            },
          },
        }}
      />
    </Stack>
  );
}
