import { Share } from "react-native";

import { Session } from "@/types";
import { formatSessionTime } from "./formatDate";
import { useConferenceStore } from "@/store/conferenceStore";
import conference from "../../conference.config";

/** Open the system share sheet with the session details. */
export const shareSession = async (session: Session) => {
  const { venueTimezone } = useConferenceStore.getState();
  const message = [
    `${session.title} at ${conference.name}`,
    formatSessionTime(session, false, venueTimezone),
    conference.website,
  ]
    .filter(Boolean)
    .join("\n");

  try {
    await Share.share({ message });
  } catch {
    // The user dismissed the share sheet
  }
};
