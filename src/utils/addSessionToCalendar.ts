import * as Calendar from "expo-calendar";
import { createEventInCalendarAsync } from "expo-calendar/legacy";
import { Platform } from "react-native";

import { Session } from "@/types";
import conference from "../../conference.config";

/** Open the system calendar UI with the session pre-filled. */
export const addSessionToCalendar = async (session: Session) => {
  const event = {
    title: session.title,
    notes: session.description ?? undefined,
    location: session.room ?? conference.venue?.name,
    startDate: new Date(session.startsAt),
    endDate: new Date(session.endsAt),
  };

  try {
    if (Platform.OS === "ios") {
      // The current API needs write-only access to resolve the default calendar.
      const { status } = await Calendar.requestCalendarPermissions(true);
      if (status !== "granted") {
        return;
      }
      await Calendar.getDefaultCalendarSync().addEventWithForm(event);
      return;
    }

    // On Android the current API needs calendar permission plus an existing
    // writable calendar. The legacy intent-based form needs neither, so keep
    // it there until expo-calendar offers an equivalent.
    await createEventInCalendarAsync(event);
  } catch (e) {
    console.warn(e);
  }
};
