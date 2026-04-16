// Test Settings (all should be false in production)
export const TEST_SETTINGS = {
  BYPASS_FORM_VALIDATION: false, // if true, form validation will be skipped
};

// Start and End of Working Day
// TODO: convert these to Date objects
// TODO: use the settings in mongo
const [startTime, endTime]: [string, string] = ["09:00", "12:00"];
export const WORKING_HOURS = {
  startTime,
  endTime,
};
