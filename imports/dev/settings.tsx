import { convertStrToHrs } from "../utils/utils";

// Settings
const USE_TEST_DATE_TIME = false; // Set to false to use current date and time

// Test Time for Development
const [day, month, year] = [1, 1, 2026];
const time: string = "09:00";
export const TEST_TIME = USE_TEST_DATE_TIME
  ? new Date(year, month - 1, day, ...convertStrToHrs(time))
  : null;
