import { Session } from "@/types";

/** Match a session against a search query by title, speaker, room, or tag. */
export const matchesSearch = (session: Session, query: string) => {
  const needle = query.trim().toLowerCase();
  if (!needle) {
    return true;
  }

  const haystack = [
    session.title,
    session.room ?? "",
    ...session.tags,
    ...session.speakers.map((speaker) => speaker.fullName),
  ]
    .join("\n")
    .toLowerCase();

  return haystack.includes(needle);
};
