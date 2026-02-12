export function isInteger(str: string): boolean {
  return /^\d+$/.test(str);
}

export function convertStrToHrs(timeStr: string): [number, number] {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return [hours, minutes];
}