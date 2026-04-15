import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import {
  SettingsCollection,
  Settings,
  EMERGENCY_OPTION,
  Flags,
} from "/imports/api/settings";
import { isValidTimeStr } from "/imports/utils/utils";

type FlagKey = keyof Omit<Flags, "_id">;
type BooleanFlagKey = Exclude<FlagKey, "TEST_DATE_DATE" | "TEST_DATE_TIME">;

const normalizeDateStr = (dateStr: string): string | null => {
  // Accept both DD-MM-YYYY (new) and YYYY-MM-DD (legacy), store as DD-MM-YYYY.
  if (/^\d{2}-\d{2}-\d{4}$/.test(dateStr)) {
    const [day, month, year] = dateStr.split("-").map(Number);
    const candidate = new Date(Date.UTC(year, month - 1, day));
    if (
      candidate.getUTCFullYear() === year &&
      candidate.getUTCMonth() === month - 1 &&
      candidate.getUTCDate() === day
    ) {
      return dateStr;
    }
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const [year, month, day] = dateStr.split("-").map(Number);
    const candidate = new Date(Date.UTC(year, month - 1, day));
    if (
      candidate.getUTCFullYear() === year &&
      candidate.getUTCMonth() === month - 1 &&
      candidate.getUTCDate() === day
    ) {
      return `${String(day).padStart(2, "0")}-${String(month).padStart(2, "0")}-${year}`;
    }
  }

  return null;
};

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

const updateFlag = <K extends FlagKey>(key: K, value: Flags[K]) => {
  return SettingsCollection.updateAsync(
    { _id: "app_flags" },
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

  async "settings.setTheme"(theme: string) {
    check(theme, String);
    await updateSetting("theme", theme);
  },

  async "settings.setFlag"(key: BooleanFlagKey, value: boolean) {
    check(key, String);
    check(value, Boolean);

    const allowedKeys: BooleanFlagKey[] = [
      "ENABLE_TEST_PAGES",
      "USE_TEST_DATE",
      "FREEZE_TIME",
      "USE_TIME_MULTIPLIER",
      "BYPASS_FORM_VALIDATION",
    ];

    if (!allowedKeys.includes(key)) {
      throw new Meteor.Error("invalid-flag", `Unknown flag: ${key}`);
    }

    await updateFlag(key, value);
  },

  async "settings.setTestDateDate"(date: string) {
    check(date, String);
    const normalizedDate = normalizeDateStr(date);
    if (!normalizedDate) {
      throw new Meteor.Error("invalid-date", `Invalid date: ${date}`);
    }
    await updateFlag("TEST_DATE_DATE", normalizedDate);
  },

  async "settings.setTestDateTime"(time: string) {
    check(time, String);
    if (!isValidTimeStr(time)) {
      throw new Meteor.Error("invalid-time", `Invalid time: ${time}`);
    }
    await updateFlag("TEST_DATE_TIME", time);
  },
});

// ---- Settings Methods ----
export async function setDayStarted(started: boolean) {
  return Meteor.callAsync("settings.setDayStarted", started);
}

// TODO: do tests for the working hours to make sure theyre properly formatted
export async function setStartOfDay(start: string) {
  if (!isValidTimeStr(start)) return;
  return Meteor.callAsync("settings.setStartOfDay", start);
}

export async function setEndOfDay(end: string) {
  if (!isValidTimeStr(end)) return;
  return Meteor.callAsync("settings.setEndOfDay", end);
}

export async function setTextFrequency(minutes: number) {
  return Meteor.callAsync("settings.setTextFrequency", minutes);
}

export async function setTextMessageTemplate(template: string) {
  return Meteor.callAsync("settings.setTextMessageTemplate", template);
}

export async function setEmergencyOption(
  option: (typeof EMERGENCY_OPTION)[number],
) {
  return Meteor.callAsync("settings.setEmergencyOption", option);
}

export async function setAcceptQueueAfterHours(value: boolean) {
  return Meteor.callAsync("settings.setAcceptQueueAfterHours", value);
}

export async function setAppTheme(theme: string) {
  return Meteor.callAsync("settings.setTheme", theme);
}

export async function getSettings(): Promise<Settings> {
  return (await SettingsCollection.findOneAsync({
    _id: "app_settings",
  })) as Settings;
}

// ---- Flags Methods ----

export async function getFlags(): Promise<Flags> {
  return (await SettingsCollection.findOneAsync({ _id: "app_flags" })) as Flags;
}

export async function setFlag(key: BooleanFlagKey, value: boolean) {
  return Meteor.callAsync("settings.setFlag", key, value);
}

export async function setEnableTestPages(value: boolean) {
  return setFlag("ENABLE_TEST_PAGES", value);
}

export async function setUseTestDate(value: boolean) {
  // If disabling test pages, also disable all related flags
  if (!value) {
    await setFlag("USE_TEST_DATE", false);
    await setFlag("FREEZE_TIME", false);
    await setFlag("USE_TIME_MULTIPLIER", false);
  }
  return setFlag("USE_TEST_DATE", value);
}

export async function setFreezeTime(value: boolean) {
  return setFlag("FREEZE_TIME", value);
}

export async function setUseTimeMultiplier(value: boolean) {
  return setFlag("USE_TIME_MULTIPLIER", value);
}

export async function setBypassFormValidation(value: boolean) {
  return setFlag("BYPASS_FORM_VALIDATION", value);
}

export async function setTestDateDate(date: string) {
  const normalizedDate = normalizeDateStr(date);
  if (!normalizedDate) return;
  return Meteor.callAsync("settings.setTestDateDate", normalizedDate);
}

export async function setTestDateTime(time: string) {
  if (!isValidTimeStr(time)) return;
  return Meteor.callAsync("settings.setTestDateTime", time);
}

