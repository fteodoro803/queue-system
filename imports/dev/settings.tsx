import { convertStrToHrs } from "../utils/utils";

// Test Settings (all should be false in production)
export const TEST_SETTINGS = {
  USE_TEST_DATE: true,
  FREEZE_TIME: false, // if true, clock won't update time
  USE_TIME_MULTIPLIER: true, // if true, time will pass faster than real time (for testing long appointments), only works when USE_TEST_DATE is true
};

// Test Time for Development
const [day, month, year] = [27, 2, 2026];
const time: string = "09:00";
export const TEST_DATE = TEST_SETTINGS.USE_TEST_DATE
  ? new Date(year, month - 1, day, ...convertStrToHrs(time))
  : null;
export const TIME_MULTIPLIER = TEST_SETTINGS.USE_TIME_MULTIPLIER ? 60 : 1; // 1 real second = 1 simulated minute

// Start and End of Working Day
// TODO: convert these to Date objects
const [startTime, endTime]: [string, string] = ["09:00", "12:00"];
export const WORKING_HOURS = {
  startTime,
  endTime,
};
