import { formatDate, parseISO } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";

import { ScheduleDay, Session } from "@/types";

// All venue-time helpers take the timezone explicitly. Components read it
// from the conference store, which lets the dev dataset switcher preview
// conferences in other timezones. Node scripts pass it from the config.

const timeFormat = "h:mm aaa";
const dateTimeFormat = `${timeFormat}, LLL d`;
const fullDateFormat = `${timeFormat}, LLL d, yyyy`;

const DAY_KEY_FORMAT = "yyyy-MM-dd";

/** The calendar date of a timestamp in the venue timezone, as yyyy-MM-dd. */
export const toVenueDate = (date: string | Date, timezone: string) => {
  try {
    return formatInTimeZone(new Date(date), timezone, DAY_KEY_FORMAT);
  } catch {
    return "";
  }
};

export const formatSessionTime = (
  session: Session,
  shouldUseLocalTz: boolean,
  venueTimezone: string,
) => {
  try {
    const startsAtDate = new Date(session.startsAt);
    const endsAtDate = new Date(session.endsAt);

    if (shouldUseLocalTz) {
      return `${formatDate(startsAtDate, dateTimeFormat)} - ${formatDate(endsAtDate, dateTimeFormat)}`;
    } else {
      return `${formatInTimeZone(startsAtDate, venueTimezone, timeFormat)} - ${formatInTimeZone(endsAtDate, venueTimezone, timeFormat)}`;
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

/** Short venue timezone label, e.g. "PDT" from config, else "GMT-7". */
export const getVenueTimezoneAbbreviation = (
  timezone: string,
  abbreviation?: string,
) => {
  if (abbreviation) {
    return abbreviation;
  }
  try {
    return formatInTimeZone(new Date(), timezone, "zzz");
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
export const getCurrentDayIndex = (days: ScheduleDay[], timezone: string) => {
  const today = toVenueDate(new Date(), timezone);
  const index = days.findIndex((day) => day.date === today);
  return index === -1 ? null : index;
};

/** Day to show on launch: today when the conference is running, else day 1. */
export const getInitialDayIndex = (days: ScheduleDay[], timezone: string) =>
  getCurrentDayIndex(days, timezone) ?? 0;
