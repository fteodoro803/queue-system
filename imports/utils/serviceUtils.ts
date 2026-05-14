import {
  SERVICE_SHORTCODE_MAX_LENGTH,
  SERVICE_SHORTCODE_MIN_LENGTH,
} from "/imports/api/service";

export function isValidShortcode(shortcode: string): boolean {
  return (
    shortcode.length >= SERVICE_SHORTCODE_MIN_LENGTH &&
    shortcode.length <= SERVICE_SHORTCODE_MAX_LENGTH
  );
}
