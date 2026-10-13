import { useConferenceStore } from "@/store/conferenceStore";
import {
  getCurrentTimezone,
  getVenueTimezoneAbbreviation,
} from "@/utils/formatDate";
import * as Device from "expo-device";
import {
  ContextMenu,
  Host,
  HStack,
  Image,
  Picker,
  Text,
} from "@expo/ui/swift-ui";
import * as Haptics from "expo-haptics";
import { isLiquidGlassAvailable } from "expo-glass-effect";
import { buttonStyle, frame } from "@expo/ui/swift-ui/modifiers";
import { theme } from "@/theme";
import { StyleSheet, useColorScheme } from "react-native";

const isIpad = Device.osName === "iPadOS";

export function TimeZoneSwitch() {
  const shouldUseLocalTz = useConferenceStore(
    (state) => state.shouldUseLocalTz,
  );
  const toggleLocalTz = useConferenceStore((state) => state.toggleLocalTz);
  const venueTimezone = useConferenceStore((state) => state.venueTimezone);
  const venueTimezoneAbbreviation = useConferenceStore(
    (state) => state.venueTimezoneAbbreviation,
  );
  const isDarkMode = useColorScheme() === "dark";

  const venueAbbreviation = getVenueTimezoneAbbreviation(
    venueTimezone,
    venueTimezoneAbbreviation,
  );
  const options = [
    `${venueAbbreviation} (Venue)`,
    `${getCurrentTimezone()} (Local)`,
  ];

  const selectedIndex = shouldUseLocalTz ? 1 : 0;

  const handleToggleLocalTz = (newIndex: number) => {
    if (selectedIndex !== newIndex) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      toggleLocalTz();
    }
  };

  return (
    <Host style={styles.container}>
      <ContextMenu
        modifiers={[
          buttonStyle(isLiquidGlassAvailable() ? "glass" : "bordered"),
        ]}
      >
        <ContextMenu.Items>
          <Picker
            selectedIndex={selectedIndex}
            options={options}
            onOptionSelected={({ nativeEvent: { index } }) =>
              handleToggleLocalTz(index)
            }
          />
        </ContextMenu.Items>
        <ContextMenu.Trigger>
          <HStack
            modifiers={[frame({ width: isIpad ? 60 : 50 })]}
            spacing={theme.space8}
          >
            <Text
              weight="semibold"
              size={theme.fontSize10}
              color={
                isLiquidGlassAvailable()
                  ? "primary"
                  : isDarkMode
                    ? "white"
                    : "black"
              }
            >
              {shouldUseLocalTz
                ? getCurrentTimezone().slice(0, 3)
                : venueAbbreviation}
            </Text>
            <Image
              systemName="chevron.down"
              size={theme.fontSize10}
              color={isLiquidGlassAvailable() ? "primary" : "gray"}
            />
          </HStack>
        </ContextMenu.Trigger>
      </ContextMenu>
    </Host>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 34,
    width: 94,
  },
});
