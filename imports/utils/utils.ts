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

// Converts "HH:MM" to locale time string like "02:30 PM"
export function timeStrToLocaleTime(timeStr: string): string {
  const [hours, minutes] = timeStr.split(":").map(Number);
  const date = new Date();
  date.setHours(hours, minutes);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// Time format (like "02:30 PM")
export function formatDateToLocale(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

// Converts a date to a specified number of months later
export function addMonths(date: Date, months: number): Date {
  const newDate = new Date(date);
  newDate.setMonth(newDate.getMonth() + months);
  return newDate;
}
