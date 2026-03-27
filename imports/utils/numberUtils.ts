/**
 * Formats a string of digits into a Philippine phone number format.
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

  const trimmed = value.trim().replace(/\s/g, ""); // strip spaces first
  const hasLeadingPlus = trimmed.startsWith("+");
  const digits = trimmed.replace(/\D/g, "");

  // Keep partial + input stable while typing/backspacing.
  if (hasLeadingPlus && digits.length === 0) return "+";

  if (hasLeadingPlus && !digits.startsWith("63")) {
    return `+${digits.slice(0, 11)}`;
  }

  if ((hasLeadingPlus && digits.startsWith("63")) || digits.startsWith("63")) {
    const localDigits = digits.slice(2, 12); // keep up to 10 digits after country code
    const prefix = hasLeadingPlus ? "+63" : "63";

    if (localDigits.length === 0) return prefix;
    if (localDigits.length <= 3) return `${prefix} ${localDigits}`;
    if (localDigits.length <= 6) {
      return `${prefix} ${localDigits.slice(0, 3)} ${localDigits.slice(3)}`;
    }
    return `${prefix} ${localDigits.slice(0, 3)} ${localDigits.slice(3, 6)} ${localDigits.slice(6, 10)}`;
  }

  const localDigits = digits.slice(0, 11); // strip non-digits, cap at 11
  if (localDigits.length <= 4) return localDigits;
  if (localDigits.length <= 7)
    return `${localDigits.slice(0, 4)} ${localDigits.slice(4)}`;
  return `${localDigits.slice(0, 4)} ${localDigits.slice(4, 7)} ${localDigits.slice(7, 11)}`;
}
