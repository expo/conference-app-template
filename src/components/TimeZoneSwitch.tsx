import { StyleSheet } from "react-native";

import { ThemedPressable, ThemedText } from "./Themed";

import { useConferenceStore } from "@/store/conferenceStore";
import { theme } from "@/theme";
import {
  getCurrentTimezone,
  getVenueTimezoneAbbreviation,
} from "@/utils/formatDate";
import * as Haptics from "expo-haptics";

export function TimeZoneSwitch() {
  const shouldUseLocalTz = useConferenceStore(
    (state) => state.shouldUseLocalTz,
  );
  const toggleLocalTz = useConferenceStore((state) => state.toggleLocalTz);
  const venueTimezone = useConferenceStore((state) => state.venueTimezone);
  const venueTimezoneAbbreviation = useConferenceStore(
    (state) => state.venueTimezoneAbbreviation,
  );

  const handleToggleLocalTz = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    toggleLocalTz();
  };

  return (
    <ThemedPressable
      style={styles.container}
      onPress={handleToggleLocalTz}
      backgroundColor={theme.color.backgroundSecondary}
    >
      <ThemedText fontSize={theme.fontSize12} fontWeight="semiBold">
        {shouldUseLocalTz
          ? getCurrentTimezone()
          : getVenueTimezoneAbbreviation(
              venueTimezone,
              venueTimezoneAbbreviation,
            )}
      </ThemedText>
    </ThemedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: "flex-end",
    borderRadius: theme.borderRadius40,
    height: 32,
    justifyContent: "center",
    paddingHorizontal: theme.space16,
  },
});
