import { convertStrToHrs } from "../utils/utils";

// Test Settings (all should be false in production)
const USE_TEST_DATE = true;

// Test Time for Development
const [day, month, year] = [18, 2, 2026];
const time: string = "09:00";
export const TEST_DATE = USE_TEST_DATE
  ? new Date(year, month - 1, day, ...convertStrToHrs(time))
  : null;
