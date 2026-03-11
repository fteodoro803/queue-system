import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { SettingsCollection, Settings, EMERGENCY_OPTION } from "./settings";
import { isValidTimeStr } from "../utils/utils";

// Helper to update a single field
const updateSetting = <K extends keyof Omit<Settings, "_id">>(
  key: K,
  value: Settings[K],
) => {
  SettingsCollection.updateAsync(
    { _id: "app_settings" },
    { $set: { [key]: value } },
  );
};

Meteor.methods({
  "settings.setStartOfDay"(start: string) {
    check(start, String);
    updateSetting("start_of_day", start);
  },

  "settings.setEndOfDay"(end: string) {
    check(end, String);
    updateSetting("end_of_day", end);
  },

  "settings.setTextFrequency"(minutes: number) {
    check(minutes, Number);
    updateSetting("text_frequency", minutes);
  },

  "settings.setTextMessageTemplate"(template: string) {
    check(template, String);
    updateSetting("text_message_template", template);
  },

  "settings.setEmergencyOption"(option: (typeof EMERGENCY_OPTION)[number]) {
    updateSetting("emergency_option", option);
  },

  "settings.setAcceptQueueAfterHours"(value: boolean) {
    check(value, Boolean);
    updateSetting("accept_queue_after_hours", value);
  },
});

// TODO: do tests for the working hours to make sure theyre properly formatted
export async function setStartOfDay(start: string) {
  if (!isValidTimeStr(start)) return;
  return await Meteor.callAsync("settings.setStartOfDay", start);
}

export async function setEndOfDay(end: string) {
  if (!isValidTimeStr(end)) return;
  return await Meteor.callAsync("settings.setEndOfDay", end);
}

export async function setTextFrequency(minutes: number) {
  return await Meteor.callAsync("settings.setTextFrequency", minutes);
}

export async function setTextMessageTemplate(template: string) {
  return await Meteor.callAsync("settings.setTextMessageTemplate", template);
}

export async function setEmergencyOption(
  option: (typeof EMERGENCY_OPTION)[number],
) {
  return await Meteor.callAsync("settings.setEmergencyOption", option);
}

export async function setAcceptQueueAfterHours(value: boolean) {
  return await Meteor.callAsync("settings.setAcceptQueueAfterHours", value);
}
