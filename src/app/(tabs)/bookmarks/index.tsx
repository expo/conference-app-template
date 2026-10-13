import React, { useCallback } from "react";
import { Platform, Pressable, StyleSheet, View } from "react-native";

import { ThemedText, useThemeColor } from "@/components/Themed";
import { theme } from "@/theme";
import { TalkCard } from "@/components/TalkCard";
import { useBookmarkStore } from "@/store/bookmarkStore";
import { useConferenceStore } from "@/store/conferenceStore";
import { Session } from "@/types";
import Animated, {
  FadeIn,
  FadeOut,
  LinearTransition,
} from "react-native-reanimated";
import { Link } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Bookmarks() {
  const bookmarks = useBookmarkStore((state) => state.bookmarks);

  const days = useConferenceStore((state) => state.days);

  const backgroundColor = useThemeColor(theme.color.background);

  const { bottom } = useSafeAreaInsets();

  const bookmarkedTalks = days.flatMap((day, dayIndex) =>
    day.sessions
      .filter((session) => !!bookmarks.find((b) => b.sessionId === session.id))
      .map((talk) => ({ talk, dayIndex })),
  );

  const renderItem = useCallback(
    ({ item }: { item: { talk: Session; dayIndex: number } }) => (
      <Animated.View key={item.talk.id} entering={FadeIn} exiting={FadeOut}>
        <TalkCard
          session={item.talk}
          dayIndex={item.dayIndex}
          isBookmarked={true}
        />
      </Animated.View>
    ),
    [],
  );

  return (
    <Animated.FlatList
      contentInsetAdjustmentBehavior="automatic"
      style={{ backgroundColor }}
      contentContainerStyle={[
        styles.flatListContainer,
        {
          paddingBottom: Platform.select({ android: 100 + bottom, default: 0 }),
        },
      ]}
      data={bookmarkedTalks}
      renderItem={renderItem}
      keyExtractor={(item) => item.talk.id}
      itemLayoutAnimation={LinearTransition}
      ListEmptyComponent={
        <Animated.View entering={FadeIn} exiting={FadeOut}>
          <View style={styles.bookmarks}>
            <ThemedText fontWeight="bold" fontSize={theme.fontSize20}>
              No sessions bookmarked
            </ThemedText>
            <ThemedText
              fontSize={theme.fontSize18}
              color={theme.color.textSecondary}
            >
              Tap on the bookmark icon on a session to add it to your bookmarks,
              and it will be displayed here.
            </ThemedText>
            <Link href="/(tabs)/(calendar)" asChild>
              <Pressable>
                <ThemedText
                  color={theme.color.tint}
                  style={{ marginTop: theme.space2 }}
                >
                  View all sessions
                </ThemedText>
              </Pressable>
            </Link>
          </View>
        </Animated.View>
      }
    />
  );
}

const styles = StyleSheet.create({
  bookmarks: {
    gap: theme.space16,
    paddingHorizontal: theme.space16,
  },
  flatListContainer: {
    paddingTop: theme.space16,
  },
});
