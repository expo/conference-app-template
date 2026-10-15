import { Link, useRouter } from "expo-router";
import { StyleSheet, useWindowDimensions, View } from "react-native";

import { Bookmark } from "./Bookmark";
import { ThemedText, ThemedView, useThemeColor } from "./Themed";
import { theme } from "../theme";
import { Session, Speaker } from "@/types";
import { formatSessionTime } from "../utils/formatDate";

import { useConferenceStore } from "@/store/conferenceStore";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { SpeakerDetails } from "./SpeakerDetails";
import * as Haptics from "expo-haptics";
import { useMemo } from "react";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

type Props = {
  session: Session;
  dayIndex: number;
  isBookmarked?: boolean;
  /**
   * Replaces the default action, which opens the talk sheet. Wide layouts
   * use it to show the talk in a detail pane instead.
   */
  onPress?: (session: Session) => void;
  /** Highlights the card as the talk shown in the detail pane. */
  isSelected?: boolean;
};

export function TalkCard({
  session,
  dayIndex,
  isBookmarked = false,
  onPress,
  isSelected = false,
}: Props) {
  const selectedBorderColor = useThemeColor(theme.color.tint);
  const borderColor = useThemeColor(theme.color.transparent);
  const venueTimezone = useConferenceStore((state) => state.venueTimezone);
  const { width } = useWindowDimensions();
  const router = useRouter();

  const gestureTalkTap = useMemo(
    () =>
      Gesture.Tap()
        .maxDistance(10)
        .runOnJS(true)
        .onEnd(() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          if (onPress) {
            onPress(session);
            return;
          }
          router.push({
            pathname: "/talk/[talk]",
            params: { talk: session.id },
          });
        }),
    [router, session, onPress],
  );

  const createSpeakerTapGesture = (speaker: Speaker) =>
    Gesture.Tap()
      .maxDistance(10)
      .runOnJS(true)
      .onEnd(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        router.push({
          pathname: "/speaker/[speaker]",
          params: { speaker: speaker.id },
        });
      });

  return (
    <Animated.View entering={FadeIn} exiting={FadeOut}>
      <GestureDetector gesture={gestureTalkTap}>
        <ThemedView style={styles.container}>
          {!isBookmarked && (
            <ThemedText
              fontSize={theme.fontSize14}
              fontWeight="medium"
              color={theme.color.textSecondary}
              marginBottom={theme.space8}
              style={{ marginLeft: theme.space24 }}
            >
              {formatSessionTime(session, venueTimezone)}
            </ThemedText>
          )}
          <ThemedView
            color={theme.color.backgroundSecondary}
            style={[
              styles.content,
              { borderColor: isSelected ? selectedBorderColor : borderColor },
            ]}
          >
            <View
              style={{
                marginHorizontal: -theme.space16,
                paddingHorizontal: theme.space16,
                marginVertical: -theme.space8,
                paddingVertical: theme.space8,
              }}
            >
              <View style={styles.titleAndBookmark}>
                <ThemedText
                  fontSize={theme.fontSize18}
                  fontWeight="semiBold"
                  style={styles.title}
                >
                  {session.title}
                </ThemedText>
              </View>
              {isBookmarked && (
                <View style={styles.time}>
                  <ThemedText
                    fontSize={theme.fontSize14}
                    fontWeight="medium"
                    color={theme.color.textSecondary}
                  >
                    {formatSessionTime(session, venueTimezone)},
                  </ThemedText>
                  <ThemedText
                    fontSize={theme.fontSize14}
                    fontWeight="medium"
                    color={theme.color.textSecondary}
                  >
                    {`Day ${dayIndex + 1}`}
                  </ThemedText>
                </View>
              )}
            </View>
            <View style={styles.bookmarkContainer}>
              <Bookmark session={session} size="small" />
            </View>
            {session.speakers.map((speaker) => (
              <GestureDetector
                key={speaker.id}
                gesture={createSpeakerTapGesture(speaker)}
              >
                <Link
                  href={{
                    pathname: "/speaker/[speaker]",
                    params: { speaker: speaker.id },
                  }}
                  asChild
                >
                  <Link.Trigger>
                    <View
                      style={{
                        marginHorizontal: -theme.space16,
                        paddingHorizontal: theme.space16,
                        marginVertical: -theme.space8,
                        paddingVertical: theme.space8,
                        borderRadius: theme.borderRadius32,
                      }}
                    >
                      <SpeakerDetails speaker={speaker} />
                    </View>
                  </Link.Trigger>
                  <Link.Preview style={{ ...styles.preview, width }} />
                </Link>
              </GestureDetector>
            ))}
          </ThemedView>
        </ThemedView>
      </GestureDetector>
    </Animated.View>
  );
}

const SELECTED_BORDER_WIDTH = 2;

const styles = StyleSheet.create({
  bookmarkContainer: {
    position: "absolute",
    right: theme.space24,
    top: theme.space24,
  },
  container: {
    borderRadius: theme.borderRadius10,
    marginBottom: theme.space24,
    marginHorizontal: theme.space16,
  },
  content: {
    // A transparent border keeps the size stable when the card is selected
    borderRadius: theme.borderRadius32,
    borderWidth: SELECTED_BORDER_WIDTH,
    gap: theme.space24,
    padding: theme.space24 - SELECTED_BORDER_WIDTH,
  },
  preview: {
    height: 420,
  },
  time: {
    borderRadius: theme.borderRadius10,
    flexDirection: "row",
    gap: theme.space8,
  },
  title: {
    flex: 1,
    marginRight: 40,
  },
  titleAndBookmark: {
    alignItems: "center",
    flexDirection: "row",
    gap: theme.space8,
    justifyContent: "space-between",
  },
});
