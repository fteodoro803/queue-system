import { convertStrToHrs } from "../utils/utils";

// Test Settings (all should be false in production)
export const TEST_SETTINGS = {
  USE_TEST_DATE: true,
  FREEZE_TIME: false, // if true, clock won't update time
};

// Test Time for Development
const [day, month, year] = [27, 2, 2026];
const time: string = "09:00";
export const TEST_DATE = TEST_SETTINGS.USE_TEST_DATE
  ? new Date(year, month - 1, day, ...convertStrToHrs(time))
  : null;

// Start and End of Working Day
const [startTime, endTime]: [string, string] = ["09:00", "12:00"];
export const WORKING_HOURS = {
  startTime,
  endTime,
};
