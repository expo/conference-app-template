// The normalized data schema. Every data source is mapped to this shape.
// Organizers without Sessionize can host a JSON file in this shape and set
// data: { source: "json", url: "..." } in conference.config.ts.
// Keep this file free of runtime imports so Node scripts can use it.

export type NormalizedSpeaker = {
  id: string;
  fullName: string;
  bio: string | null;
  tagLine: string | null;
  profilePicture: string | null;
  links: { title: string; url: string; linkType: string }[];
  sessionIds: string[];
};

export type NormalizedSession = {
  id: string;
  title: string;
  description: string | null;
  /** ISO timestamp in venue local time or with an offset. */
  startsAt: string;
  endsAt: string;
  room: string | null;
  tags: string[];
  /** True for breaks, registration, and other non-talk slots. */
  isServiceSession: boolean;
  speakerIds: string[];
};

export type NormalizedData = {
  sessions: NormalizedSession[];
  speakers: NormalizedSpeaker[];
};

/** Light structural check for data fetched from a remote JSON file. */
export const isNormalizedData = (data: unknown): data is NormalizedData => {
  if (typeof data !== "object" || data === null) {
    return false;
  }
  const { sessions, speakers } = data as Record<string, unknown>;
  if (!Array.isArray(sessions) || !Array.isArray(speakers)) {
    return false;
  }
  return (
    sessions.every(
      (session) =>
        typeof session === "object" &&
        session !== null &&
        typeof session.id === "string" &&
        typeof session.title === "string" &&
        typeof session.startsAt === "string" &&
        typeof session.endsAt === "string" &&
        Array.isArray(session.speakerIds),
    ) &&
    speakers.every(
      (speaker) =>
        typeof speaker === "object" &&
        speaker !== null &&
        typeof speaker.id === "string" &&
        typeof speaker.fullName === "string" &&
        Array.isArray(speaker.sessionIds),
    )
  );
};
