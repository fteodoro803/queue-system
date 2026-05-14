// Philippine Number Pattern
// Matches: 09xx xxx xxxx | +63 9xx xxx xxxx | 63 9xx xxx xxxx
export const philippinePattern = "^(\\+639|639|09)\\d{9}$";

/**
 *
 * @param value
 * @returns true if the input value matches the Philippine phone number pattern, false otherwise.
 */
export function isPhilippineNumber(value: string): boolean {
  const compact = value.trim().replace(/\s/g, "");
  return new RegExp(philippinePattern).test(compact);
}

/**
 * Formats a string of digits into a Philippine phone number format with spaces.
 * @param value The input string containing digits.
 * @returns The formatted phone number string.
 *
 * Example:
 * formatNumberDisplay("09171234567") => "0917 123 4567"
 * formatNumberDisplay("639991234567") => "63 999 123 4567"
 * formatNumberDisplay("+639991234567") => "+63 999 123 4567"
 */
export function formatNumberDisplay(value: string): string {
  if (!value || value.trim() === "") return "";

  // Remove all non-digit characters except a leading '+' so +63 input is preserved.
  const compact = value.trim().replace(/(?!^\+)\D/g, "");
  const digits = compact.replace(/\D/g, ""); // pure digits only

  // Preserve partial '+' states while typing until the +63 formatter can apply.
  if (compact.startsWith("+") && !compact.startsWith("+63")) {
    return `+${digits}`;
  }

  // +63 prefix
  if (compact.startsWith("+63")) {
    const local = digits.slice(2); // digits after 63
    if (local.length === 0) return "+63";
    if (local.length <= 3) return `+63 ${local}`;
    if (local.length <= 6) return `+63 ${local.slice(0, 3)} ${local.slice(3)}`;
    return `+63 ${local.slice(0, 3)} ${local.slice(3, 6)} ${local.slice(6, 10)}`;
  }

  // 63 prefix
  if (compact.startsWith("63")) {
    const local = digits.slice(2);
    if (local.length === 0) return "63";
    if (local.length <= 3) return `63 ${local}`;
    if (local.length <= 6) return `63 ${local.slice(0, 3)} ${local.slice(3)}`;
    return `63 ${local.slice(0, 3)} ${local.slice(3, 6)} ${local.slice(6, 10)}`;
  }

  // 09 local format
  const local = digits.slice(0, 11);
  if (local.length <= 4) return local;
  if (local.length <= 7) return `${local.slice(0, 4)} ${local.slice(4)}`;
  return `${local.slice(0, 4)} ${local.slice(4, 7)} ${local.slice(7, 11)}`;
}

/**
 * Formats a formatted Philippine phone number string into a normalised format, starting with 0 and without spaces.
 * @param value The input string containing digits.
 * @returns The formatted phone number string.
 *
 * Example:
 * normaliseNumber("0917 123 4567") => "09171234567"
 * normaliseNumber("63 999 123 4567") => "09991234567"
 * normaliseNumber("+63 999 123 4567") => "09991234567"
 */
export function normaliseNumber(value: string): string {
  if (!value || value.trim() === "") return "";

  // 1. Replace a leading +63 or 63 with 0
  let normalised = value.trim().replace(/^\+?63/, "0");

  // 2. Remove all non-digit characters
  normalised = normalised.replace(/\D/g, "");

  return normalised;
}
