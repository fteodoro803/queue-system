import React, { useEffect, useState } from "react";
import { ThemeController } from "/imports/ui/components/ThemeController";
import { useFind, useSubscribe } from "meteor/react-meteor-data";
import {
  DEFAULT_FLAGS,
  Flags,
  Settings,
  SettingsCollection,
} from "/imports/api/settings";
import { Loading } from "/imports/ui/components/Loading";
import {
  clearAllData,
  clearQueueEntries,
  clearStats,
  setAcceptQueueAfterHours,
  setAppTheme,
  seedDemoData,
  setEnableTestPages,
  setFreezeTime,
  setTestDate,
  setUseTestDate,
  setUseTimeMultiplier,
  setMultiplier,
  setStartOfDay,
  setEndOfDay,
} from "/imports/api/settingsMethods";
import { styles } from "/imports/utils/styles";
import { useDateTime } from "/imports/contexts/DateTimeContext";

type BooleanFlagKey = Exclude<
  keyof Omit<Flags, "_id">,
  "TEST_DATE" | "TIME_MULTIPLIER"
>;

export const SettingsPage = () => {
  const now = useDateTime();
  const isSettingsLoading = useSubscribe("settings");
  const settings = useFind(() =>
    SettingsCollection.find({ _id: "app_settings" }),
  )[0] as Settings | undefined;
  const flags = useFind(() =>
    SettingsCollection.find({ _id: "app_flags" }),
  )[0] as Flags | undefined;
  const [acceptAfterHours, setAcceptAfterHours] = useState(false);
  const [theme, setTheme] = useState<string>("default");
  const [startOfDay, setStartOfDayState] = useState<string>("09:00");
  const [endOfDay, setEndOfDayState] = useState<string>("17:00");

  // What user edits in the form before saving to db
  const [draftFlags, setDraftFlags] =
    useState<Omit<Flags, "_id">>(DEFAULT_FLAGS);

  // snapshot of current settings for comparison
  const [currentSettings, setCurrentSettings] = useState<{
    acceptAfterHours: boolean;
    theme: string;
    startOfDay: string;
    endOfDay: string;
    developerFlags: Omit<Flags, "_id">;
  } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSeeding, setIsSeeding] = useState(false);
  const [isClearingQueue, setIsClearingQueue] = useState(false);
  const [isClearingStats, setIsClearingStats] = useState(false);
  const [isClearingAllData, setIsClearingAllData] = useState(false);

  // Fill settings from db
  useEffect(() => {
    if (settings && flags) {
      // 1. Get flag fields
      const dbFlags: Omit<Flags, "_id"> = {
        ENABLE_TEST_FEATURES: flags.ENABLE_TEST_FEATURES,
        USE_TEST_DATE: flags.USE_TEST_DATE,
        FREEZE_TIME: flags.FREEZE_TIME,
        USE_TIME_MULTIPLIER: flags.USE_TIME_MULTIPLIER,
        TEST_DATE: flags.TEST_DATE ?? DEFAULT_FLAGS.TEST_DATE,
        TIME_MULTIPLIER: flags.TIME_MULTIPLIER ?? DEFAULT_FLAGS.TIME_MULTIPLIER,
      };

      // 2. Copy new settings to state's settings
      const newSettings = {
        acceptAfterHours: settings.accept_queue_after_hours,
        theme: settings.theme,
        startOfDay: settings.start_of_day,
        endOfDay: settings.end_of_day,
        developerFlags: dbFlags,
      };

      setAcceptAfterHours(newSettings.acceptAfterHours);
      setTheme(newSettings.theme);
      setStartOfDayState(newSettings.startOfDay);
      setEndOfDayState(newSettings.endOfDay);
      setDraftFlags(cloneFlags(dbFlags));
      setCurrentSettings(newSettings);
      setSaveError(null);
    }
  }, [settings, flags]);

  // Draft-only handlers (no writes until Save).
  const handleAcceptAfterHoursChange = (value: boolean) => {
    setAcceptAfterHours(value);
  };

  const handleStartOfDayChange = (value: string) => {
    setStartOfDayState(value);
  };

  const handleEndOfDayChange = (value: string) => {
    setEndOfDayState(value);
  };

  const handleThemeChange = (value: string) => {
    setTheme(value);
  };

  const handleFlagChange = (key: BooleanFlagKey, value: boolean) => {
    setDraftFlags((prev) => {
      if (key === "USE_TEST_DATE" && !value) {
        return {
          ...prev,
          USE_TEST_DATE: false,
          FREEZE_TIME: false,
          USE_TIME_MULTIPLIER: false,
        };
      }

      return { ...prev, [key]: value };
    });
  };

  const handleTestDateChange = (date: Date) => {
    if (Number.isNaN(date.getTime())) return;
    setDraftFlags((prev) => ({ ...prev, TEST_DATE: date }));
  };

  const handleMultiplierChange = (multiplier: number) => {
    if (!Number.isFinite(multiplier) || multiplier <= 0) return;
    setDraftFlags((prev) => ({ ...prev, TIME_MULTIPLIER: multiplier }));
  };

  // Compare the local draft against baseline to enable Save/Cancel only when needed.
  const hasChanges =
    currentSettings != null &&
    (acceptAfterHours !== currentSettings.acceptAfterHours ||
      theme !== currentSettings.theme ||
      startOfDay !== currentSettings.startOfDay ||
      endOfDay !== currentSettings.endOfDay ||
      (Object.keys(draftFlags) as Array<keyof Omit<Flags, "_id">>).some(
        (key) =>
          !areFlagValuesEqual(
            key,
            draftFlags[key],
            currentSettings.developerFlags[key],
          ),
      ));

  // Time strings are HH:mm, so lexical compare is valid for same-day ordering.
  const isWorkdayRangeInvalid = startOfDay >= endOfDay;

  const handleCancel = () => {
    if (!currentSettings) return;
    setAcceptAfterHours(currentSettings.acceptAfterHours);
    setTheme(currentSettings.theme);
    setStartOfDayState(currentSettings.startOfDay);
    setEndOfDayState(currentSettings.endOfDay);
    setDraftFlags(cloneFlags(currentSettings.developerFlags));
    setSaveError(null);
  };

  const handleSave = async () => {
    if (!currentSettings || !hasChanges || isWorkdayRangeInvalid) return;

    setIsSaving(true);
    setSaveError(null);
    try {
      await setAcceptQueueAfterHours(acceptAfterHours);
      await setAppTheme(theme);
      await setStartOfDay(startOfDay);
      await setEndOfDay(endOfDay);
      await setEnableTestPages(draftFlags.ENABLE_TEST_FEATURES);
      await setUseTestDate(draftFlags.USE_TEST_DATE);
      await setFreezeTime(draftFlags.FREEZE_TIME);
      await setUseTimeMultiplier(draftFlags.USE_TIME_MULTIPLIER);
      await setTestDate(draftFlags.TEST_DATE);
      await setMultiplier(draftFlags.TIME_MULTIPLIER);

      const savedBaseline = {
        acceptAfterHours,
        theme,
        startOfDay,
        endOfDay,
        developerFlags: cloneFlags(draftFlags),
      };
      setCurrentSettings(savedBaseline);
      setDraftFlags(cloneFlags(savedBaseline.developerFlags));
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Failed to save");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSeedDemoData = async () => {
    setIsSeeding(true);
    try {
      await seedDemoData(now);
    } catch {
      // Intentionally silent: no visible feedback for dev utility action.
    } finally {
      setIsSeeding(false);
    }
  };

  const handleClearQueueEntries = async () => {
    setIsClearingQueue(true);
    try {
      await clearQueueEntries();
    } catch {
      // Intentionally silent: no visible feedback for dev utility action.
    } finally {
      setIsClearingQueue(false);
    }
  };

  const handleClearStats = async () => {
    setIsClearingStats(true);
    try {
      await clearStats();
    } catch {
      // Intentionally silent: no visible feedback for dev utility action.
    } finally {
      setIsClearingStats(false);
    }
  };

  const handleClearAllData = async () => {
    const isConfirmed = window.confirm(
      "Delete all services, providers, patients, queue entries, appointments, stats, and counters? This cannot be undone.",
    );
    if (!isConfirmed) return;

    setIsClearingAllData(true);
    try {
      await clearAllData();
    } catch {
      // Intentionally silent: no visible feedback for dev utility action.
    } finally {
      setIsClearingAllData(false);
    }
  };

  const isUseTestDateEnabled = draftFlags.USE_TEST_DATE;
  const settingsCardClass = `card bg-base-100 shadow-sm ${styles.outline}`;
  const settingsFieldLabelClass = "label-text mr-2 font-medium";
  const settingsToggleRowClass =
    "label flex w-full cursor-pointer flex-wrap items-start justify-between gap-3";
  const settingsRowBodyClass = "min-w-0 flex-1";
  const settingsActionRowClass =
    "flex flex-wrap items-start justify-between gap-3";
  const compactFieldClass = "w-full sm:max-w-xs";
  const nestedDeveloperSectionClass =
    "space-y-4 sm:ml-6 sm:border-l sm:border-base-300 sm:pl-4";
  const mobileActionButtonClass = "w-full shrink-0 sm:w-auto";

  if (isSettingsLoading()) return <Loading />;

  return (
    <div className="mx-auto flex w-full min-w-0 max-w-2xl flex-col gap-6">
      <h1 className="text-3xl font-bold">Settings</h1>

      {/* General */}
      <div className={settingsCardClass}>
        <div className="card-body gap-5 sm:gap-6">
          <h2 className="card-title text-lg">General</h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="form-control min-w-0">
              <label className="label">
                <span className={settingsFieldLabelClass}>Start Time</span>
              </label>
              <input
                type="time"
                value={startOfDay}
                onChange={(e) => handleStartOfDayChange(e.target.value)}
                className="input input-bordered w-full"
              />
            </div>

            <div className="form-control min-w-0">
              <label className="label">
                <span className={settingsFieldLabelClass}>End Time</span>
              </label>
              <input
                type="time"
                value={endOfDay}
                onChange={(e) => handleEndOfDayChange(e.target.value)}
                className="input input-bordered w-full"
              />
            </div>
          </div>

          {isWorkdayRangeInvalid && (
            <p className="text-sm text-error">
              Start Time must be earlier than End Time.
            </p>
          )}
        </div>
      </div>

      {/* Notifications */}
      <div className={settingsCardClass}>
        <div className="card-body gap-5 sm:gap-6">
          <h2 className="card-title text-lg">Notifications</h2>

          {/* Text Frequency */}
          <div className="form-control min-w-0">
            <label className="label">
              <span className={settingsFieldLabelClass}>
                Text Message Frequency (mins)
              </span>
            </label>
            <select className={`select select-bordered ${compactFieldClass}`}>
              <option value="15">15</option>
              <option value="30">30</option>
              <option value="60">60</option>
            </select>
          </div>

          {/* Text Message */}
          <div className="form-control min-w-0 gap-1">
            <label className="label">
              <span className={settingsFieldLabelClass}>
                Text Message Template
              </span>
            </label>
            <textarea
              className="textarea textarea-bordered h-24 resize-none"
              placeholder="Your appointment is estimated to start in 15 minutes. Please check in with the receptionist when you arrive."
            />
          </div>
        </div>
      </div>

      {/* Queue Settings */}
      <div className={settingsCardClass}>
        <div className="card-body gap-5 sm:gap-6">
          <h2 className="card-title text-lg">Queue</h2>

          {/* Emergency Settings */}
          <div className="form-control min-w-0 gap-1">
            <label className="label">
              <span className={settingsFieldLabelClass}>
                Emergency Handling
              </span>
            </label>
            <select className={`select select-bordered ${compactFieldClass}`}>
              <option value="1">Option 1</option>
              <option value="2">Option 2</option>
            </select>
          </div>

          {/* Accept after hours */}
          <div className="form-control min-w-0">
            <label className="label flex cursor-pointer items-start gap-3 sm:gap-4">
              <input
                type="checkbox"
                checked={acceptAfterHours}
                onChange={(e) => handleAcceptAfterHoursChange(e.target.checked)}
                className="toggle toggle-success mt-0.5 shrink-0"
              />
              <div className="min-w-0">
                <span className="label-text font-medium leading-snug">
                  Accept Queue Patients After Work Hours
                </span>
                <p className="text-xs leading-relaxed opacity-60">
                  Warns them if they try to join after hours, but allows them to
                  proceed if they confirm.
                </p>
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* Appearance */}
      <div className={settingsCardClass}>
        <div className="card-body gap-4">
          <h2 className="card-title text-lg">Appearance</h2>
          <div className="form-control min-w-0 gap-1">
            <label className="label">
              <span className={settingsFieldLabelClass}>Theme</span>
            </label>
            <ThemeController theme={theme} onChange={handleThemeChange} />
          </div>
        </div>
      </div>

      {/* Developer Flags */}
      <div className={settingsCardClass}>
        <div className="card-body gap-4 sm:gap-5">
          <h2 className="card-title text-lg text-warning">Developer Flags</h2>

          {/* Enable Test Pages */}
          <label className={settingsToggleRowClass}>
            <div className={settingsRowBodyClass}>
              <span className="label-text font-medium leading-snug">
                Enable Test Features
              </span>
              <p className="text-xs leading-relaxed opacity-60">
                Shows testing features and pages.
              </p>
            </div>
            <input
              type="checkbox"
              checked={draftFlags.ENABLE_TEST_FEATURES}
              onChange={(e) =>
                handleFlagChange("ENABLE_TEST_FEATURES", e.target.checked)
              }
              className="toggle toggle-warning mt-1 shrink-0"
            />
          </label>

          {/* Use Test Date */}
          <label className={settingsToggleRowClass}>
            <div className={settingsRowBodyClass}>
              <span className="label-text font-medium leading-snug">
                Use Test Date
              </span>
              <p className="text-xs leading-relaxed opacity-60">
                Uses the fixed development date/time instead of real-time clock.
              </p>
            </div>
            <input
              type="checkbox"
              checked={draftFlags.USE_TEST_DATE}
              onChange={(e) =>
                handleFlagChange("USE_TEST_DATE", e.target.checked)
              }
              className="toggle toggle-warning mt-1 shrink-0"
            />
          </label>

          {/* Test Date and Time */}
          <div className={nestedDeveloperSectionClass}>
            <div className="form-control min-w-0">
              <label className="label py-1">
                <span className="label-text font-medium">Date &amp; Time</span>
              </label>
              <input
                type="datetime-local"
                value={toLocalDatetimeString(draftFlags.TEST_DATE)}
                disabled={!isUseTestDateEnabled}
                onChange={(e) => handleTestDateChange(new Date(e.target.value))}
                className={`input input-bordered ${compactFieldClass}`}
              />
            </div>

            {/* Freeze Time */}
            <label className={settingsToggleRowClass}>
              <div className={settingsRowBodyClass}>
                <span className="label-text font-medium leading-snug">
                  Freeze Time
                </span>
                <p className="text-xs leading-relaxed opacity-60">
                  Stops the app clock from ticking while this flag is enabled.
                </p>
              </div>
              <input
                type="checkbox"
                checked={draftFlags.FREEZE_TIME}
                disabled={!isUseTestDateEnabled}
                onChange={(e) =>
                  handleFlagChange("FREEZE_TIME", e.target.checked)
                }
                className="toggle toggle-warning mt-1 shrink-0"
              />
            </label>

            {/* Use Time Multiplier */}
            <label className={settingsToggleRowClass}>
              <div className={settingsRowBodyClass}>
                <span className="label-text font-medium leading-snug">
                  Use Time Multiplier (seconds)
                </span>
                <p className="text-xs leading-relaxed opacity-60">
                  Speeds up test time progression. (1 real second ={" "}
                  {draftFlags.TIME_MULTIPLIER} test seconds)
                </p>
              </div>
              <input
                type="checkbox"
                checked={draftFlags.USE_TIME_MULTIPLIER}
                disabled={!isUseTestDateEnabled}
                onChange={(e) =>
                  handleFlagChange("USE_TIME_MULTIPLIER", e.target.checked)
                }
                className="toggle toggle-warning mt-1 shrink-0"
              />
            </label>

            <div className="form-control min-w-0">
              <label className="label py-1">
                <span className="label-text font-medium">Multiplier</span>
              </label>
              <input
                type="number"
                min={1}
                max={120}
                step={1}
                value={draftFlags.TIME_MULTIPLIER}
                disabled={
                  !isUseTestDateEnabled || !draftFlags.USE_TIME_MULTIPLIER
                }
                onChange={(e) => handleMultiplierChange(Number(e.target.value))}
                className={`input input-bordered ${compactFieldClass}`}
              />
            </div>
          </div>

          <div className={settingsActionRowClass}>
            <div className={settingsRowBodyClass}>
              <p className="font-medium">Force Reseed Demo Data</p>
              <p className="text-xs leading-relaxed opacity-60">
                Clears existing demo/business data and inserts fresh demo
                services, providers, patients, queue entries, and stats.
              </p>
            </div>
            <button
              type="button"
              className={`btn btn-warning btn-sm ${mobileActionButtonClass}`}
              onClick={handleSeedDemoData}
              disabled={isSeeding}
            >
              {isSeeding ? "Reseeding..." : "Force Reseed"}
            </button>
          </div>

          <div className={settingsActionRowClass}>
            <div className={settingsRowBodyClass}>
              <p className="font-medium">Clear Queue Entries</p>
              <p className="text-xs leading-relaxed opacity-60">
                Deletes all current queue entries.
              </p>
            </div>
            <button
              type="button"
              className={`btn btn-error btn-sm ${mobileActionButtonClass}`}
              onClick={handleClearQueueEntries}
              disabled={isClearingQueue}
            >
              {isClearingQueue ? "Clearing..." : "Clear Queue"}
            </button>
          </div>

          <div className={settingsActionRowClass}>
            <div className={settingsRowBodyClass}>
              <p className="font-medium">Clear Stats</p>
              <p className="text-xs leading-relaxed opacity-60">
                Deletes all statistics records without touching queue entries.
              </p>
            </div>
            <button
              type="button"
              className={`btn btn-error btn-sm ${mobileActionButtonClass}`}
              onClick={handleClearStats}
              disabled={isClearingStats}
            >
              {isClearingStats ? "Clearing..." : "Clear Stats"}
            </button>
          </div>

          <div className={settingsActionRowClass}>
            <div className={settingsRowBodyClass}>
              <p className="font-medium">Delete All Data</p>
              <p className="text-xs leading-relaxed opacity-60">
                Deletes services, providers, patients, queue entries,
                appointments, stats, and counters. Settings and flags are kept.
              </p>
            </div>
            <button
              type="button"
              className={`btn btn-error btn-sm ${mobileActionButtonClass}`}
              onClick={handleClearAllData}
              disabled={isClearingAllData}
            >
              {isClearingAllData ? "Deleting..." : "Delete All"}
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button
          type="button"
          className="btn btn-outline w-full sm:w-auto"
          onClick={handleCancel}
          disabled={!hasChanges || isSaving}
        >
          Cancel
        </button>
        <button
          type="button"
          className="btn btn-primary w-full sm:w-auto"
          onClick={handleSave}
          disabled={!hasChanges || isSaving || isWorkdayRangeInvalid}
        >
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {saveError && <p className="text-sm text-error">{saveError}</p>}
    </div>
  );
};

const cloneFlags = (source: Omit<Flags, "_id">): Omit<Flags, "_id"> => ({
  ...source,
  TEST_DATE: new Date(source.TEST_DATE),
});

const areFlagValuesEqual = (
  key: keyof Omit<Flags, "_id">,
  left: Omit<Flags, "_id">[keyof Omit<Flags, "_id">],
  right: Omit<Flags, "_id">[keyof Omit<Flags, "_id">],
) => {
  if (key === "TEST_DATE") {
    return (
      new Date(left as Date).getTime() === new Date(right as Date).getTime()
    );
  }
  return Object.is(left, right);
};

const toLocalDatetimeString = (date: Date) => {
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
};
