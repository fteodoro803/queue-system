import {
  SERVICE_SHORTCODE_MAX_LENGTH,
  SERVICE_SHORTCODE_MIN_LENGTH,
} from "/imports/api/service";

export function normaliseShortcode(shortcode: string): string {
  return shortcode.trim().toUpperCase();
}

export function isValidShortcode(shortcode: string): boolean {
  return (
    shortcode.length >= SERVICE_SHORTCODE_MIN_LENGTH &&
    shortcode.length <= SERVICE_SHORTCODE_MAX_LENGTH
  );
}
