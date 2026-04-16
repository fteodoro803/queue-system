// Test Settings (all should be false in production)
export const TEST_SETTINGS = {
  USE_TIME_MULTIPLIER: false, // if true, time will pass faster than real time (for testing long appointments), only works when USE_TEST_DATE is true
  BYPASS_FORM_VALIDATION: false, // if true, form validation will be skipped
};

// Test Time for Development
export const TIME_MULTIPLIER = TEST_SETTINGS.USE_TIME_MULTIPLIER ? 10 : 1; // 1 real second = 10 seconds

// Start and End of Working Day
// TODO: convert these to Date objects
// TODO: use the settings in mongo
const [startTime, endTime]: [string, string] = ["09:00", "12:00"];
export const WORKING_HOURS = {
  startTime,
  endTime,
};
