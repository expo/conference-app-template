import { Link } from "expo-router";
import { StyleSheet, View } from "react-native";
import { Pressable } from "react-native-gesture-handler";

import { ThemedText, ThemedView, useThemeColor } from "./Themed";

import { useConferenceStore } from "@/store/conferenceStore";
import { theme } from "@/theme";
import { formatSessionTime } from "@/utils/formatDate";
import { findSessionInDays } from "@/utils/sessions";
import { Bookmark } from "./Bookmark";

export function MiniTalkCard({ sessionId }: { sessionId: string | number }) {
  const venueTimezone = useConferenceStore((state) => state.venueTimezone);
  const days = useConferenceStore((state) => state.days);
  const backgroundColor = useThemeColor(theme.color.backgroundSecondary);
  const textSecondaryColor = useThemeColor(theme.color.textSecondary);

  const { session: talk, dayIndex } = findSessionInDays(sessionId, days);

  if (!talk) {
    return null;
  }

  return (
    <Link
      push
      href={{
        pathname: "/talk/[speaker]",
        params: { speaker: talk.id },
      }}
      asChild
    >
      <Pressable>
        <ThemedView style={[styles.container, { backgroundColor }]}>
          <View style={styles.containerInner}>
            <ThemedText fontSize={theme.fontSize16} fontWeight="semiBold">
              {talk.title}
            </ThemedText>
            <ThemedText
              fontSize={theme.fontSize14}
              fontWeight="medium"
              color={{ light: textSecondaryColor, dark: textSecondaryColor }}
              style={{ marginBottom: theme.space8 }}
            >
              {formatSessionTime(talk, venueTimezone)}
              {` `}(Day {dayIndex + 1})
            </ThemedText>
          </View>
          <Bookmark session={talk} size="small" />
        </ThemedView>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    borderRadius: theme.borderRadius10,
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: theme.space24,
    padding: theme.space24,
  },
  containerInner: {
    flexShrink: 1,
    gap: theme.space4,
  },
});
