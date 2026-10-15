import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import { Bookmark } from "@/components/Bookmark";
import { TalkDetails } from "@/components/TalkDetails";
import { ThemedText, ThemedView } from "@/components/Themed";
import { theme } from "@/theme";
import { Session } from "@/types";

type Props = {
  talk: Session | undefined;
  dayIndex: number;
  /** Shown when no talk is selected. */
  emptyMessage?: string;
};

/**
 * The trailing pane of a wide layout. Shows the selected talk in place of
 * the talk sheet that narrow layouts open.
 */
export function TalkDetailPane({
  talk,
  dayIndex,
  emptyMessage = "Select a session to see the details",
}: Props) {
  return (
    <ScrollView
      // A new key per talk resets the scroll position to the top
      key={talk?.id ?? "empty"}
      // Insets the content below the navigation bar, like the list beside it
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <ThemedView style={styles.card} color={theme.color.backgroundSecondary}>
        {talk ? (
          <>
            <View style={styles.toolbar}>
              <Bookmark session={talk} />
            </View>
            <TalkDetails talk={talk} dayIndex={dayIndex} centerTitle={false} />
          </>
        ) : (
          <View style={styles.empty}>
            <ThemedText
              fontSize={theme.fontSize16}
              color={theme.color.textSecondary}
            >
              {emptyMessage}
            </ThemedText>
          </View>
        )}
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: theme.borderRadius32,
    overflow: "hidden",
    paddingBottom: theme.space8,
    paddingTop: theme.space16,
  },
  empty: {
    alignItems: "center",
    padding: theme.space24,
  },
  scrollContent: {
    paddingBottom: theme.space24,
    paddingTop: theme.space16,
  },
  toolbar: {
    alignItems: "flex-end",
    paddingHorizontal: theme.space24,
  },
});
