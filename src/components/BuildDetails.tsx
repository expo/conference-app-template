import * as Application from "expo-application";
import { View, StyleSheet } from "react-native";

import { ThemedText } from "./Themed";

import { useConferenceStore } from "@/store/conferenceStore";
import { theme } from "@/theme";
import { formatFullDate } from "@/utils/formatDate";
import { useUpdates } from "expo-updates";

export function BuildDetails() {
  const lastRefreshed = useConferenceStore((state) => state.lastRefreshed);
  const updates = useUpdates();

  const currentUpdateId = updates?.currentlyRunning?.updateId;

  return (
    <View style={styles.container}>
      <ThemedText fontSize={theme.fontSize12}>
        v{Application.nativeApplicationVersion} (
        {Application.nativeBuildVersion})
      </ThemedText>
      <ThemedText fontSize={theme.fontSize12}>
        Schedule last refreshed:{" "}
        {lastRefreshed ? formatFullDate(lastRefreshed) : "Never"}
      </ThemedText>
      {currentUpdateId ? (
        <ThemedText
          fontSize={theme.fontSize12}
          style={{ color: theme.colorGrey }}
        >
          {currentUpdateId}
        </ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: theme.space8,
    paddingTop: theme.space12,
  },
});
