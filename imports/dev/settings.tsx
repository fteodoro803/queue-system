import { convertStrToHrs } from "../utils/utils";

// Test Settings (all should be false in production)
const USE_TEST_DATE_TIME = true; // Set to false to use current date and time

// Test Time for Development
const [day, month, year] = [18, 2, 2026];
const time: string = "09:00";
export const TEST_DATE = USE_TEST_DATE_TIME
  ? new Date(year, month - 1, day, ...convertStrToHrs(time))
  : null;
