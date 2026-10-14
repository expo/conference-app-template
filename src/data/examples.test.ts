import { formatInTimeZone } from "date-fns-tz";

import { isNormalizedData, NormalizedData } from "./schema";
import snapshot from "./snapshot.json";
import appjsConfig from "../../examples/appjs-conf-2025/conference.config";
import appjsData from "../../examples/appjs-conf-2025/data.json";
import nextjsConfig from "../../examples/nextjs-conf-2024/conference.config";
import nextjsData from "../../examples/nextjs-conf-2024/data.json";
import conference from "../../conference.config";

const examples: {
  name: string;
  timezone: string;
  data: unknown;
  days: number;
}[] = [
  {
    name: "bundled snapshot",
    timezone: conference.timezone,
    data: snapshot,
    days: 2,
  },
  {
    name: "nextjs-conf-2024",
    timezone: nextjsConfig.timezone,
    data: nextjsData,
    days: 1,
  },
  {
    name: "appjs-conf-2025",
    timezone: appjsConfig.timezone,
    data: appjsData,
    days: 3,
  },
];

describe.each(examples)("$name", ({ timezone, data, days }) => {
  it("matches the normalized schema", () => {
    expect(isNormalizedData(data)).toBe(true);
  });

  it("has consistent session and speaker references", () => {
    const { sessions, speakers } = data as NormalizedData;
    const sessionIds = new Set(sessions.map((session) => session.id));
    const speakerIds = new Set(speakers.map((speaker) => speaker.id));

    for (const session of sessions) {
      for (const speakerId of session.speakerIds) {
        expect(speakerIds).toContain(speakerId);
      }
    }
    for (const speaker of speakers) {
      for (const sessionId of speaker.sessionIds) {
        expect(sessionIds).toContain(sessionId);
      }
    }
  });

  it(`spans ${days} day(s) in the venue timezone`, () => {
    const { sessions } = data as NormalizedData;
    const dates = new Set(
      sessions.map((session) =>
        formatInTimeZone(new Date(session.startsAt), timezone, "yyyy-MM-dd"),
      ),
    );
    expect(dates.size).toBe(days);
  });
});
