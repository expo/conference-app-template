import * as Calendar from "expo-calendar";

import { Session } from "@/types";
import conference from "../../conference.config";

/** Open the system calendar UI with the session pre-filled. */
export const addSessionToCalendar = async (session: Session) => {
  try {
    await Calendar.createEventInCalendarAsync({
      title: session.title,
      notes: session.description ?? undefined,
      location: session.room ?? conference.venue?.name,
      startDate: new Date(session.startsAt),
      endDate: new Date(session.endsAt),
      timeZone: conference.timezone,
    });
  } catch (e) {
    console.warn(e);
  }
};
