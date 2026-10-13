import { formatDate, parseISO } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";

import { ScheduleDay, Session } from "@/types";
import conference from "../../conference.config";

const timeFormat = "h:mm aaa";
const dateTimeFormat = `${timeFormat}, LLL d`;
const fullDateFormat = `${timeFormat}, LLL d, yyyy`;

export const VENUE_TIMEZONE = conference.timezone;

const DAY_KEY_FORMAT = "yyyy-MM-dd";

/** The calendar date of a timestamp in the venue timezone, as yyyy-MM-dd. */
export const toVenueDate = (date: string | Date) => {
  try {
    return formatInTimeZone(new Date(date), VENUE_TIMEZONE, DAY_KEY_FORMAT);
  } catch {
    return "";
  }
};

export const formatSessionTime = (
  session: Session,
  shouldUseLocalTz: boolean,
) => {
  try {
    const startsAtDate = new Date(session.startsAt);
    const endsAtDate = new Date(session.endsAt);

    if (shouldUseLocalTz) {
      return `${formatDate(startsAtDate, dateTimeFormat)} - ${formatDate(endsAtDate, dateTimeFormat)}`;
    } else {
      return `${formatInTimeZone(startsAtDate, VENUE_TIMEZONE, timeFormat)} - ${formatInTimeZone(endsAtDate, VENUE_TIMEZONE, timeFormat)}`;
    }
  } catch {
    return "...";
  }
};

export const formatFullDate = (dateString: string) => {
  try {
    return formatDate(new Date(dateString), fullDateFormat);
  } catch {
    return "...";
  }
};

export const getCurrentTimezone = () => {
  try {
    return formatDate(new Date(), "zzzz");
  } catch {
    return "...";
  }
};

/** Abbreviated venue timezone name right now, e.g. "PDT". */
export const getVenueTimezoneAbbreviation = () => {
  try {
    return formatInTimeZone(new Date(), VENUE_TIMEZONE, "zzz");
  } catch {
    return "...";
  }
};

/** "Oct 7" for a yyyy-MM-dd day key. */
export const formatDayShort = (dayKey: string) => {
  try {
    return formatDate(parseISO(dayKey), "LLL d");
  } catch {
    return dayKey;
  }
};

/** "Oct 7, 2025" for a yyyy-MM-dd day key. */
export const formatDayLong = (dayKey: string) => {
  try {
    return formatDate(parseISO(dayKey), "LLL d, yyyy");
  } catch {
    return dayKey;
  }
};

/** Index of today in the schedule (venue timezone), or null. */
export const getCurrentDayIndex = (days: ScheduleDay[]) => {
  const today = toVenueDate(new Date());
  const index = days.findIndex((day) => day.date === today);
  return index === -1 ? null : index;
};

/** Day to show on launch: today when the conference is running, else day 1. */
export const getInitialDayIndex = (days: ScheduleDay[]) =>
  getCurrentDayIndex(days) ?? 0;
