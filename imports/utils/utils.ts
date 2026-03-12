// ----- Checks -----
export function isInteger(str: string): boolean {
  return /^\d+$/.test(str);
}

// ----- Time Utilities -----

// Converts "HH:MM" to [hour, minute, second]
// Useful for creating Date objects with specific times
export function convertStrToHrs(timeStr: string): [number, number, number] {
  const [hour = "0", minute = "0", second = "0"] = timeStr.split(":");
  return [parseInt(hour, 10), parseInt(minute, 10), parseInt(second, 10)];
}

// TODO: use the startOfDay in settings instead
export function getStartOfDay(date: Date): Date {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  return startOfDay;
}

// TODO: use the endOfDay in settings instead
export function getEndOfDay(date: Date): Date {
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  return endOfDay;
}

// Get the end of the work day based on a time string like "17:00" and a date
export function getEndOfWorkDay(date: Date, time: string): Date {
  const [hour, minute] = convertStrToHrs(time);
  const endOfWorkDay = new Date(date);
  endOfWorkDay.setHours(hour, minute, 0, 0);
  return endOfWorkDay;
}

export function createTimeSlots(
  minHour: number,
  maxHour: number,
  interval: number,
): string[] {
  const timeSlots: string[] = [];
  for (let hour = minHour; hour < maxHour; hour++) {
    for (let minute = 0; minute < 60; minute += interval) {
      const timeStr = `${hour.toString().padStart(2, "0")}:${minute
        .toString()
        .padStart(2, "0")}`;
      timeSlots.push(timeStr);
    }
  }
  return timeSlots;
}

// Check if a time string is in the format "HH:MM" and represents a valid time
export function isValidTimeStr(timeStr: string): boolean {
  if (!/^\d{2}:\d{2}$/.test(timeStr)) return false;
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60;
}

// Converts "HH:MM" to locale time string like "02:30 PM"
export function timeStrToLocaleTime(timeStr: string): string {
  const [hours, minutes] = timeStr.split(":").map(Number);
  const date = new Date();
  date.setHours(hours, minutes);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// Time format (like "02:30 PM")
export function formatDateToLocale(date: Date, seconds?: boolean): string {
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    ...(seconds ? { second: "2-digit" } : {}),
  });
}

// Converts a date to a specified number of months later
export function addMonths(date: Date, months: number): Date {
  const newDate = new Date(date);
  newDate.setMonth(newDate.getMonth() + months);
  return newDate;
}

// Adds minutes to a date
export const addMinutes = (date: Date, minutes: number): Date => {
  return new Date(date.getTime() + minutes * 60000);
};

// Format milliseconds to human-readable format like "1h 30m"
export function convertMillisecondsToTime(time_ms: number): string {
  const hours = Math.floor(time_ms / (1000 * 60 * 60));
  const minutes = Math.floor((time_ms % (1000 * 60 * 60)) / (1000 * 60));

  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}

// Format minutes to human-readable format like "1h 30m"
export function convertMinutesToTime(time_min: number): string {
  const hours = Math.floor(time_min / 60);
  const minutes = time_min % 60;

  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}
