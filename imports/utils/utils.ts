export function isInteger(str: string): boolean {
  return /^\d+$/.test(str);
}

export function convertStrToHrs(timeStr: string): [number, number, number] {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return [hours, minutes, 0];
}

export function getStartOfDay(date: Date): Date {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  return startOfDay;
}

export function getEndOfDay(date: Date): Date {
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  return endOfDay;
}