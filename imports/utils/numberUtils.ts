// Philippine Number Pattern

import { TEST_SETTINGS } from "/imports/dev/settings";

// Matches: 09xx xxx xxxx | +63 9xx xxx xxxx | 63 9xx xxx xxxx
export const philippinePattern = "^(\\+639|639|09)\\d{9}$";

/**
 *
 * @param value
 * @returns true if the input value matches the Philippine phone number pattern, false otherwise.
 */
export function isPhilippineNumber(value: string): boolean {
  if (TEST_SETTINGS.BYPASS_FORM_VALIDATION) return true;
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
