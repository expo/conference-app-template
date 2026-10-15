import React, { useCallback } from "react";
import {
  Keyboard,
  Platform,
  Pressable,
  StyleSheet,
  useWindowDimensions,
} from "react-native";

import { NotFound } from "@/components/NotFound";

import { ThemedText, ThemedView, useThemeColor } from "@/components/Themed";
import { useConferenceStore } from "@/store/conferenceStore";
import { theme } from "@/theme";
import { Link, useLocalSearchParams } from "expo-router";
import { SpeakerDetails } from "@/components/SpeakerDetails";
import { useBookmark } from "@/hooks/useBookmark";
import { Speaker } from "@/types";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLayout } from "@/hooks/useLayout";
import Animated, {
  FadeIn,
  FadeOut,
  LinearTransition,
} from "react-native-reanimated";

export default function Speakers() {
  const speakers = useConferenceStore((state) => state.speakers);
  const { width, height } = useWindowDimensions();
  const { bottom, top, left, right } = useSafeAreaInsets();
  const { isWide } = useLayout();
  // Wide windows show a grid with columns of at least SPEAKER_COLUMN_MIN_WIDTH
  const numColumns = isWide
    ? Math.max(
        2,
        Math.floor(
          (width - left - right - 2 * theme.space16) / SPEAKER_COLUMN_MIN_WIDTH,
        ),
      )
    : 1;
  const { toggleBookmarkById, isBookmarked, getSessionById } = useBookmark();
  const backgroundColor = useThemeColor(theme.color.background);

  const params = useLocalSearchParams<{ q?: string }>();

  const searchText = params?.q?.toLowerCase() || "";

  const filteredSpeakers = speakers.filter((speaker) => {
    if (!searchText) {
      return true;
    }
    return speaker.fullName.toLowerCase().includes(searchText);
  });

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  const renderItem = useCallback(
    ({ item }: { item: Speaker }) => {
      return (
        <Animated.View
          key={item.id}
          entering={FadeIn}
          exiting={FadeOut}
          style={{ width: `${100 / numColumns}%` }}
        >
          <Link
            push
            key={item.id}
            href={{
              pathname: "/speaker/[speaker]",
              params: { speaker: item.id },
            }}
            asChild
          >
            <Link.Trigger>
              <Pressable
                onLongPress={() => {
                  // adding this to prevent navigating on long press instead of opening the preview
                }}
                style={styles.speakerContainer}
              >
                <SpeakerDetails speaker={item} key={item.id} />
              </Pressable>
            </Link.Trigger>
            <Link.Preview style={{ ...styles.preview, width: width }} />
            <Link.Menu title={`Talks by ${item.fullName}`}>
              {item.sessionIds
                .map((sessionId) => {
                  const sessionIdStr = sessionId.toString();
                  const session = getSessionById(sessionIdStr);
                  const bookmarked = isBookmarked(sessionIdStr);

                  if (!session) return null;

                  return (
                    <Link.MenuAction
                      key={sessionIdStr}
                      title={session.title}
                      icon={bookmarked ? "bookmark.fill" : "bookmark"}
                      isOn={bookmarked}
                      onPress={() => toggleBookmarkById(sessionIdStr)}
                    />
                  );
                })
                .filter(
                  (item): item is NonNullable<typeof item> => item !== null,
                )}
            </Link.Menu>
          </Link>
        </Animated.View>
      );
    },
    [width, numColumns, getSessionById, isBookmarked, toggleBookmarkById],
  );

  if (!speakers.length) {
    return <NotFound message="Speakers unavailable" />;
  }

  return (
    <Animated.FlatList
      // FlatList cannot change numColumns on the fly, so remount instead
      key={numColumns}
      numColumns={numColumns}
      scrollToOverflowEnabled
      contentInsetAdjustmentBehavior="automatic"
      onScrollBeginDrag={dismissKeyboard}
      keyboardShouldPersistTaps="handled"
      style={{ backgroundColor }}
      contentContainerStyle={[
        styles.contentContainer,
        {
          paddingBottom: Platform.select({ android: 100 + bottom, default: 0 }),
        },
        { minHeight: height - (bottom + top + 130) },
        // Adds the safe area to the list's own side padding
        {
          paddingLeft: theme.space16 + left,
          paddingRight: theme.space16 + right,
        },
      ]}
      ItemSeparatorComponent={() => (
        <ThemedView style={styles.separator} color={theme.color.border} />
      )}
      extraData={isBookmarked || searchText}
      renderItem={renderItem}
      data={filteredSpeakers}
      keyExtractor={(item) => item.id}
      itemLayoutAnimation={LinearTransition}
      ListEmptyComponent={
        <Animated.View entering={FadeIn} exiting={FadeOut}>
          <ThemedView style={styles.noResultsContainer}>
            <ThemedText>
              No results found for{" "}
              <ThemedText fontWeight="bold">{searchText}</ThemedText>
            </ThemedText>
          </ThemedView>
        </Animated.View>
      }
    />
  );
}

const SPEAKER_COLUMN_MIN_WIDTH = 300;

export const styles = StyleSheet.create({
  contentContainer: {
    paddingHorizontal: theme.space16,
  },
  noResultsContainer: {
    padding: theme.space24,
  },
  preview: {
    height: 420,
  },
  separator: {
    height: 1,
  },
  speakerContainer: {
    paddingRight: theme.space16,
    paddingVertical: theme.space16,
  },
});
