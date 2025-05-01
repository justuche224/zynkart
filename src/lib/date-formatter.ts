import {
  format,
  formatDistance,
  formatRelative,
  parseISO,
  isValid,
} from "date-fns";

/**
 * Formats a date object or string as a string given a pattern.
 * @param date - Date object or string (ISO-formatted or "MM/dd/yyyy")
 * @param pattern - Date format pattern (default: "MM/dd/yyyy")
 * @returns Formatted date string
 */
export const formatDate = (
  date: Date | string | number,
  pattern: string = "MM/dd/yyyy"
): string => {
  try {
    const dateObj = typeof date === "string" ? parseISO(date) : new Date(date);
    if (!isValid(dateObj)) throw new Error("Invalid date");
    return format(dateObj, pattern);
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Invalid date";
  }
};

/**
 * Returns the relative time from the given date to now in string (e.g., "10 hours ago" or "2 days ago").
 *
 * @param date - Date object or ISO-formatted string
 * @returns Relative time from given date to now in string
 */
export const getRelativeTime = (date: Date | string | number): string => {
  try {
    const dateObj = typeof date === "string" ? parseISO(date) : new Date(date);
    if (!isValid(dateObj)) throw new Error("Invalid date");
    return formatDistance(dateObj, new Date(), { addSuffix: true });
  } catch (error) {
    console.error("Error getting relative time:", error);
    return "Invalid date";
  }
};

/**
 * Returns a relative date to now in string (e.g., "yesterday at 2:30 PM") given
 * a date object or string.
 *
 * @param date - Date object or ISO-formatted string
 * @returns Relative date to now in string
 */
export const getRelativeDate = (date: Date | string | number): string => {
  try {
    const dateObj = typeof date === "string" ? parseISO(date) : new Date(date);
    if (!isValid(dateObj)) throw new Error("Invalid date");
    return formatRelative(dateObj, new Date());
  } catch (error) {
    console.error("Error getting relative date:", error);
    return "Invalid date";
  }
};
