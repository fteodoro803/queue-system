import { Mongo } from "meteor/mongo";

export const EMERGENCY_OPTION = ["prioritise", "option2"] as const;

export interface Settings {
  _id: "app_settings";

  // 24-hour time format HH:mm
  day_started: boolean;
  start_of_day: string; // ex: "09:00" -- 9am
  end_of_day: string; // ex: "17:00" -- 5pm"

  // Notifications
  text_frequency: number; // how often to send text notifications to patients in queue in minutes
  text_message_template: string; // template for text messages, can include placeholders like {patientName}, {positionInQueue}, {estimatedWaitTime}

  // Queue
  emergency_option: (typeof EMERGENCY_OPTION)[number]; // how to handle emergency patients in the queue
  accept_queue_after_hours: boolean;

  // Theme
  theme: string;
}

export interface Flags {
  _id: "app_flags";

  ENABLE_TEST_FEATURES: boolean;
  USE_TEST_DATE: boolean;
  FREEZE_TIME: boolean; // if true, clock won't update time
  USE_TIME_MULTIPLIER: boolean; // if true, time will pass faster than real time (for testing long appointments), only works when USE_TEST_DATE is true
  BYPASS_FORM_VALIDATION: boolean; // if true, form validation will be skipped

  // Test date values in separate fields for admin settings controls
  TEST_DATE_DATE: string; // DD-MM-YYYY
  TEST_DATE_TIME: string; // HH:mm (24-hour)
  TIME_MULTIPLIER: number; // multiplier for time, only works when USE_TIME_MULTIPLIER is true
}

export const SettingsCollection = new Mongo.Collection<Settings | Flags>(
  "settings",
);

export const DEFAULT_SETTINGS: Omit<Settings, "_id"> = {
  day_started: false,
  start_of_day: "09:00",
  end_of_day: "17:00",
  text_frequency: 30,
  text_message_template:
    "Hi {patientName}, you are currently number {positionInQueue} in the queue. Estimated wait time: {estimatedWaitTime}. Please check-in with the receptionist when you arrive.",
  emergency_option: EMERGENCY_OPTION[0],
  accept_queue_after_hours: false,
  theme: "default",
};

export const DEFAULT_FLAGS: Omit<Flags, "_id"> = {
  ENABLE_TEST_FEATURES: false,
  USE_TEST_DATE: false,
  FREEZE_TIME: false,
  USE_TIME_MULTIPLIER: false,
  BYPASS_FORM_VALIDATION: false,
  TEST_DATE_DATE: "2026-01-01",
  TEST_DATE_TIME: "09:00",
  TIME_MULTIPLIER: 1,
};
