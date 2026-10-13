import { ApiAllSessions, ScheduleDay, Session, Speaker } from "@/types";
// @ts-ignore
import { allTalks } from "@/utils/testData/allSessions";
import { toVenueDate } from "./formatDate";

/** Group all sessions into conference days in the venue timezone. */
export const formatSessions = (talks: ApiAllSessions): ScheduleDay[] => {
  const allSessions = talks.sessions.map((talk) => ({
    id: talk.id,
    title: talk.title,
    description: talk.description,
    startsAt: talk.startsAt,
    endsAt: talk.endsAt,
    isServiceSession: talk.isServiceSession,
    speakers: (talk.speakers
      ?.map((speakerId) => talks.speakers.find((sp) => sp.id === speakerId))
      .filter(Boolean) || []) as Speaker[],
    room: talks.rooms.find((room) => room.id === talk.roomId)?.name || "...",
  }));

  const sessionsByDate = new Map<string, Session[]>();
  for (const session of allSessions) {
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

export const formatSession = (
  talk: ApiAllSessions["sessions"][number],
  talks: typeof allTalks,
): Session => {
  return {
    id: talk.id,
    title: talk.title,
    description: talk.description,
    startsAt: talk.startsAt,
    endsAt: talk.endsAt,
    isServiceSession: talk.isServiceSession,
    speakers: (talk.speakers
      // @ts-ignore
      ?.map((speakerId) => talks.speakers.find((sp) => sp.id === speakerId))
      .filter(Boolean) || []) as Speaker[],
    // @ts-ignore
    room: talks.rooms.find((room) => room.id === talk.roomId)?.name || "...",
  };
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
