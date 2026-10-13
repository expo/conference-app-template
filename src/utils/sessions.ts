import { NormalizedData } from "@/data/schema";
import { ScheduleDay, Session } from "@/types";
import { toVenueDate } from "./formatDate";

/** Embed speakers into sessions and group them into days, venue timezone. */
export const buildScheduleDays = (data: NormalizedData): ScheduleDay[] => {
  const speakersById = new Map(
    data.speakers.map((speaker) => [speaker.id, speaker]),
  );

  const sessions: Session[] = data.sessions.map(
    ({ speakerIds, ...session }) => ({
      ...session,
      speakers: speakerIds
        .map((speakerId) => speakersById.get(speakerId))
        .filter((speaker) => speaker !== undefined),
    }),
  );

  const sessionsByDate = new Map<string, Session[]>();
  for (const session of sessions) {
    const date = toVenueDate(session.startsAt);
    if (!date) {
      continue;
    }
    sessionsByDate.set(date, [...(sessionsByDate.get(date) ?? []), session]);
  }

  return [...sessionsByDate.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, sessions]) => ({
      date,
      sessions: sessions.sort((a, b) => a.startsAt.localeCompare(b.startsAt)),
    }));
};

/** Find a session and its day index across all days. */
export const findSessionInDays = (
  sessionId: string | number | undefined,
  days: ScheduleDay[],
): { session: Session | null; dayIndex: number } => {
  for (let dayIndex = 0; dayIndex < days.length; dayIndex++) {
    const session = days[dayIndex].sessions.find(
      (session) => session.id === String(sessionId),
    );
    if (session) {
      return { session, dayIndex };
    }
  }
  return { session: null, dayIndex: 0 };
};
