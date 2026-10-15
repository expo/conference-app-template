import { Link } from "expo-router";
import React from "react";
import { Platform, StyleSheet, View } from "react-native";
import { Pressable } from "react-native-gesture-handler";

import { Button } from "@/components/Button";
import { SpeakerImage } from "@/components/SpeakerImage";
import { ThemedText, useThemeColor } from "@/components/Themed";
import { useConferenceStore } from "@/store/conferenceStore";
import { theme } from "@/theme";
import { Session, Speaker } from "@/types";
import { addSessionToCalendar } from "@/utils/addSessionToCalendar";
import { formatDayLong, formatSessionTime } from "@/utils/formatDate";
import { shareSession } from "@/utils/shareSession";

type Props = {
  talk: Session;
  dayIndex: number;
  /** Center the title, as in the talk sheet. The detail pane leading-aligns it. */
  centerTitle?: boolean;
};

/** The body of a talk: title, speakers, date, time, venue, and actions. */
export function TalkDetails({ talk, dayIndex, centerTitle = true }: Props) {
  const days = useConferenceStore((state) => state.days);
  const venueTimezone = useConferenceStore((state) => state.venueTimezone);
  const highlightColor = useThemeColor(theme.color.tint);

  return (
    <>
      <View style={styles.header} collapsable={false}>
        <ThemedText
          fontWeight="bold"
          fontSize={theme.fontSize32}
          style={[
            styles.talkTitle,
            centerTitle && styles.centered,
            { textDecorationColor: highlightColor },
          ]}
        >
          {talk.title}
        </ThemedText>
      </View>
      <View style={styles.content}>
        {talk.speakers.map((speaker) => (
          <Link
            push
            key={speaker.id}
            href={{
              pathname: "/speaker/[speaker]",
              params: { speaker: speaker.id },
            }}
            asChild
          >
            <Pressable>
              <SpeakerRow speaker={speaker} />
            </Pressable>
          </Link>
        ))}
        <Section
          title="Date"
          value={`${formatDayLong(days[dayIndex]?.date ?? "")} (Conference Day ${dayIndex + 1})`}
        />
        <Section title="Time" value={formatSessionTime(talk, venueTimezone)} />
        <Section title="Venue" value={talk.room} />
        <Section title="Description" value={talk.description} />
        <View style={styles.actions}>
          <Button title="Share session" onPress={() => shareSession(talk)} />
          <Button
            title="Add to calendar"
            onPress={() => addSessionToCalendar(talk)}
          />
        </View>
      </View>
    </>
  );
}

function SpeakerRow({ speaker }: { speaker: Speaker }) {
  return (
    <View style={styles.speaker}>
      <SpeakerImage profilePicture={speaker.profilePicture} />
      <View style={styles.speakerDetails}>
        <ThemedText fontSize={theme.fontSize18} fontWeight="semiBold">
          {speaker.fullName}
        </ThemedText>
        <ThemedText
          fontSize={theme.fontSize14}
          fontWeight="medium"
          color={theme.color.textSecondary}
        >
          {speaker.tagLine}
        </ThemedText>
      </View>
    </View>
  );
}

function Section({ title, value }: { title: string; value: string | null }) {
  if (!value) {
    return null;
  }

  return (
    <View style={styles.sectionContainer}>
      <ThemedText fontSize={theme.fontSize18} fontWeight="semiBold">
        {title}
      </ThemedText>
      <ThemedText
        fontSize={theme.fontSize16}
        fontWeight="medium"
        color={theme.color.textSecondary}
      >
        {value}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  actions: {
    gap: theme.space12,
    marginBottom: theme.space24,
  },
  centered: {
    textAlign: "center",
  },
  content: {
    gap: theme.space8,
    paddingHorizontal: theme.space24,
    paddingTop: theme.space16,
  },
  header: {
    marginTop: Platform.select({ ios: 0, android: 30 }),
    paddingHorizontal: theme.space24,
  },
  sectionContainer: {
    gap: theme.space4,
    marginBottom: theme.space24,
  },
  speaker: {
    flexDirection: "row",
    gap: theme.space8,
    marginBottom: theme.space12,
  },
  speakerDetails: {
    flex: 1,
    justifyContent: "center",
  },
  talkTitle: {
    marginBottom: theme.space12,
  },
});
