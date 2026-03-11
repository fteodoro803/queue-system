import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { SettingsCollection, Settings, EMERGENCY_OPTION } from "./settings";
import { isValidTimeStr } from "../utils/utils";

// Helper to update a single field
const updateSetting = <K extends keyof Omit<Settings, "_id">>(
  key: K,
  value: Settings[K],
) => {
  return SettingsCollection.updateAsync(
    { _id: "app_settings" },
    { $set: { [key]: value } },
  );
};

Meteor.methods({
  async "settings.setDayStarted"(started: boolean) {
    check(started, Boolean);
    await updateSetting("day_started", started);
  },

  async "settings.setStartOfDay"(start: string) {
    check(start, String);
    await updateSetting("start_of_day", start);
  },

  async "settings.setEndOfDay"(end: string) {
    check(end, String);
    await updateSetting("end_of_day", end);
  },

  async "settings.setTextFrequency"(minutes: number) {
    check(minutes, Number);
    await updateSetting("text_frequency", minutes);
  },

  async "settings.setTextMessageTemplate"(template: string) {
    check(template, String);
    await updateSetting("text_message_template", template);
  },

  async "settings.setEmergencyOption"(
    option: (typeof EMERGENCY_OPTION)[number],
  ) {
    await updateSetting("emergency_option", option);
  },

  async "settings.setAcceptQueueAfterHours"(value: boolean) {
    check(value, Boolean);
    await updateSetting("accept_queue_after_hours", value);
  },
});

export async function setDayStarted(started: boolean) {
  return await Meteor.callAsync("settings.setDayStarted", started);
}

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
