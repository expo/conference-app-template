import { NormalizedSpeaker } from "@/data/schema";

export type Speaker = NormalizedSpeaker;

/** A session with its speakers embedded, as the UI consumes it. */
export type Session = {
  id: string;
  title: string;
  description: string | null;
  startsAt: string;
  endsAt: string;
  room: string | null;
  tags: string[];
  isServiceSession: boolean;
  speakers: Speaker[];
};

/** One conference day, derived from the session data. */
export type ScheduleDay = {
  /** Date in the venue timezone, formatted as yyyy-MM-dd. */
  date: string;
  sessions: Session[];
};
