import { Mongo } from "meteor/mongo";

export const EMERGENCY_OPTION = ["prioritise", "option2"] as const;

export interface Settings {
  _id: "app_settings";

  // 24-hour time format HH:mm
  start_of_day: string; // ex: "09:00" -- 9am
  end_of_day: string; // ex: "17:00" -- 5pm"

  // Notifications
  text_frequency: number; // how often to send text notifications to patients in queue in minutes
  text_message_template: string; // template for text messages, can include placeholders like {patientName}, {positionInQueue}, {estimatedWaitTime}

  //   Queue
  emergency_option: (typeof EMERGENCY_OPTION)[number]; // how to handle emergency patients in the queue
  accept_queue_after_hours: boolean;
}

export const SettingsCollection = new Mongo.Collection<Settings>("settings");

export const DEFAULT_SETTINGS: Omit<Settings, "_id"> = {
  start_of_day: "09:00",
  end_of_day: "17:00",
  text_frequency: 30,
  text_message_template:
    "Hi {patientName}, you are currently number {positionInQueue} in the queue. Estimated wait time: {estimatedWaitTime}. Please check-in with the receptionist when you arrive.",
  emergency_option: EMERGENCY_OPTION[0],
  accept_queue_after_hours: false,
};
