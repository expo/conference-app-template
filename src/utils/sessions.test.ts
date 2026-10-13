import { buildScheduleDays, findSessionInDays } from "./sessions";
import {
  normalizeSessionize,
  SessionizeAllData,
} from "@/data/adapters/sessionize";
import { NormalizedData } from "@/data/schema";

import { allSessions } from "@/utils/testData/allSessions";

// Timestamps are UTC; the venue timezone in conference.config.ts is
// America/Los_Angeles, so these fall on Oct 7 and Oct 8 venue time.
const normalized: NormalizedData = {
  sessions: [
    {
      id: "2",
      title: "Day two talk",
      description: null,
      startsAt: "2025-10-08T16:00:00Z",
      endsAt: "2025-10-08T16:30:00Z",
      room: "Main Hall",
      tags: [],
      isServiceSession: false,
      speakerIds: ["s1"],
    },
    {
      id: "1b",
      title: "Day one talk, afternoon",
      description: null,
      startsAt: "2025-10-07T22:00:00Z",
      endsAt: "2025-10-07T22:30:00Z",
      room: "Main Hall",
      tags: [],
      isServiceSession: false,
      speakerIds: [],
    },
    {
      id: "1a",
      title: "Day one talk, morning",
      description: null,
      startsAt: "2025-10-07T16:00:00Z",
      endsAt: "2025-10-07T16:30:00Z",
      room: "Main Hall",
      tags: [],
      isServiceSession: false,
      speakerIds: ["missing"],
    },
  ],
  speakers: [
    {
      id: "s1",
      fullName: "Ada Lovelace",
      bio: null,
      tagLine: null,
      profilePicture: null,
      links: [],
      sessionIds: ["2"],
    },
  ],
};

describe(buildScheduleDays, () => {
  it("groups sessions into sorted days with embedded speakers", () => {
    const days = buildScheduleDays(normalized);

    expect(days.map((day) => day.date)).toEqual(["2025-10-07", "2025-10-08"]);
    expect(days[0].sessions.map((session) => session.id)).toEqual(["1a", "1b"]);
    expect(days[1].sessions[0].speakers).toEqual([normalized.speakers[0]]);
  });

  it("drops speaker ids that have no matching speaker", () => {
    const days = buildScheduleDays(normalized);

    expect(days[0].sessions[0].speakers).toEqual([]);
  });
});

describe(findSessionInDays, () => {
  it("finds a session and its day index", () => {
    const days = buildScheduleDays(normalized);

    expect(findSessionInDays("2", days)).toEqual({
      session: days[1].sessions[0],
      dayIndex: 1,
    });
    expect(findSessionInDays("nope", days).session).toBeNull();
  });
});

describe(normalizeSessionize, () => {
  const data = normalizeSessionize(allSessions as unknown as SessionizeAllData);

  it("maps every session and speaker", () => {
    expect(data.sessions).toHaveLength(allSessions.sessions.length);
    expect(data.speakers).toHaveLength(allSessions.speakers.length);
  });

  it("resolves rooms, speakers, and session ids", () => {
    const talk = data.sessions.find((session) => session.id === "987074");

    expect(talk).toMatchObject({
      title: "The React Router take on RSC",
      room: "Casablanca Ballroom ",
      isServiceSession: false,
      speakerIds: ["75da261e-612c-4869-a111-3475bffb99f0"],
    });

    const speaker = data.speakers.find(
      (speaker) => speaker.id === "75da261e-612c-4869-a111-3475bffb99f0",
    );

    expect(speaker?.fullName).toBe("Kent C. Dodds");
    expect(speaker?.sessionIds).toContain("987074");
  });
});
