// Adapter for the Sessionize "All" API view.
// https://sessionize.com/playbook/api
// Keep this file free of React Native imports so Node scripts can use it.

import {
  NormalizedData,
  NormalizedSession,
  NormalizedSpeaker,
} from "../schema";

type SessionizeLink = { title: string; url: string; linkType: string };

type SessionizeSpeaker = {
  id: string;
  fullName: string;
  bio: string | null;
  tagLine: string | null;
  profilePicture: string | null;
  links: SessionizeLink[];
  sessions: number[];
};

type SessionizeSession = {
  id: string;
  title: string;
  description: string | null;
  startsAt: string;
  endsAt: string;
  isServiceSession: boolean;
  speakers: string[];
  roomId: number | null;
  categoryItems: number[];
};

type SessionizeRoom = { id: number; name: string };

type SessionizeCategory = {
  id: number;
  title: string;
  items: { id: number; name: string }[];
};

export type SessionizeAllData = {
  sessions: SessionizeSession[];
  speakers: SessionizeSpeaker[];
  rooms: SessionizeRoom[];
  categories: SessionizeCategory[];
};

export const normalizeSessionize = (
  data: SessionizeAllData,
): NormalizedData => {
  const categoryItemNames = new Map<number, string>(
    data.categories.flatMap((category) =>
      category.items.map((item) => [item.id, item.name] as [number, string]),
    ),
  );

  const sessions: NormalizedSession[] = data.sessions.map((session) => ({
    id: String(session.id),
    title: session.title,
    description: session.description,
    startsAt: session.startsAt,
    endsAt: session.endsAt,
    room: data.rooms.find((room) => room.id === session.roomId)?.name ?? null,
    tags: (session.categoryItems ?? [])
      .map((itemId) => categoryItemNames.get(itemId))
      .filter((name): name is string => !!name),
    isServiceSession: session.isServiceSession,
    speakerIds: (session.speakers ?? []).map(String),
  }));

  const speakers: NormalizedSpeaker[] = data.speakers.map((speaker) => ({
    id: String(speaker.id),
    fullName: speaker.fullName,
    bio: speaker.bio,
    tagLine: speaker.tagLine,
    profilePicture: speaker.profilePicture,
    links: speaker.links ?? [],
    sessionIds: (speaker.sessions ?? []).map(String),
  }));

  return { sessions, speakers };
};

export const getSessionizeUrl = (sessionizeId: string) =>
  `https://sessionize.com/api/v2/${sessionizeId}/view/All`;

export const fetchSessionize = async (
  sessionizeId: string,
): Promise<NormalizedData | null> => {
  try {
    const result = await fetch(getSessionizeUrl(sessionizeId));
    const data = await result.json();
    return normalizeSessionize(data);
  } catch {
    return null;
  }
};
