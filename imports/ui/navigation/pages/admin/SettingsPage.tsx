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
  setAcceptQueueAfterHours,
  setAppTheme,
  setBypassFormValidation,
  setEnableTestPages,
  setFreezeTime,
  setTestDateDate,
  setTestDateTime,
  setUseTestDate,
  setUseTimeMultiplier,
} from "/imports/api/settingsMethods";
import { styles } from "/imports/utils/styles";

type BooleanFlagKey = Exclude<
  keyof Omit<Flags, "_id">,
  "TEST_DATE_DATE" | "TEST_DATE_TIME"
>;

export const SettingsPage = () => {
  const isSettingsLoading = useSubscribe("settings");
  const settings = useFind(() =>
    SettingsCollection.find({ _id: "app_settings" }),
  )[0] as Settings | undefined;
  const flags = useFind(() =>
    SettingsCollection.find({ _id: "app_flags" }),
  )[0] as Flags | undefined;
  const [acceptAfterHours, setAcceptAfterHours] = useState(false);
  const [theme, setTheme] = useState<string>("default");
  const [developerFlags, setDeveloperFlags] =
    useState<Omit<Flags, "_id">>(DEFAULT_FLAGS);

  // ---- Effects ----
  // Update Settings
  useEffect(() => {
    if (settings) {
      setAcceptAfterHours(settings.accept_queue_after_hours);
      setTheme(settings.theme);
    }
  }, [settings]);

  // Update Flags
  useEffect(() => {
    if (flags) {
      setDeveloperFlags({
        ENABLE_TEST_PAGES: flags.ENABLE_TEST_PAGES,
        USE_TEST_DATE: flags.USE_TEST_DATE,
        FREEZE_TIME: flags.FREEZE_TIME,
        USE_TIME_MULTIPLIER: flags.USE_TIME_MULTIPLIER,
        BYPASS_FORM_VALIDATION: flags.BYPASS_FORM_VALIDATION,
        TEST_DATE_DATE: flags.TEST_DATE_DATE,
        TEST_DATE_TIME: flags.TEST_DATE_TIME,
      });
    }
  }, [flags]);

  // --- Handlers ---
  const handleAcceptAfterHoursChange = async (value: boolean) => {
    setAcceptAfterHours(value);
    await setAcceptQueueAfterHours(value);
  };

  const handleThemeChange = async (value: string) => {
    setTheme(value);
    await setAppTheme(value);
  };

  const handleFlagChange = async (key: BooleanFlagKey, value: boolean) => {
    setDeveloperFlags((prev) => {
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

    const updates: Record<
      BooleanFlagKey,
      (enabled: boolean) => Promise<unknown>
    > = {
      ENABLE_TEST_PAGES: setEnableTestPages,
      USE_TEST_DATE: setUseTestDate,
      FREEZE_TIME: setFreezeTime,
      USE_TIME_MULTIPLIER: setUseTimeMultiplier,
      BYPASS_FORM_VALIDATION: setBypassFormValidation,
    };

    await updates[key](value);
  };

  const handleTestDateDateChange = async (date: string) => {
    setDeveloperFlags((prev) => ({ ...prev, TEST_DATE_DATE: date }));
    await setTestDateDate(date);
  };

  const handleTestDateTimeChange = async (time: string) => {
    setDeveloperFlags((prev) => ({ ...prev, TEST_DATE_TIME: time }));
    await setTestDateTime(time);
  };

  const isUseTestDateEnabled = developerFlags.USE_TEST_DATE;
  const developerFlagRowClass =
    "label w-full cursor-pointer justify-between gap-4";

  if (isSettingsLoading()) return <Loading />;

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <h1 className="text-3xl font-bold">Settings</h1>

      {/* Notifications */}
      <div className={`card bg-base-100 shadow-sm ${styles.outline}`}>
        <div className="card-body gap-6">
          <h2 className="card-title text-lg">Notifications</h2>

          {/* Text Frequency */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium mr-2">
                Text Message Frequency (mins)
              </span>
            </label>
            <select className="select select-bordered w-full max-w-xs">
              <option value="15">15</option>
              <option value="30">30</option>
              <option value="60">60</option>
            </select>
          </div>

          {/* Text Message */}
          <div className="form-control gap-1">
            <label className="label">
              <span className="label-text font-medium mr-2">
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
      <div className={`card bg-base-100 shadow-sm ${styles.outline}`}>
        <div className="card-body gap-6">
          <h2 className="card-title text-lg">Queue</h2>

          {/* Emergency Settings */}
          <div className="form-control gap-1">
            <label className="label">
              <span className="label-text font-medium mr-2">
                Emergency Handling
              </span>
            </label>
            <select className="select select-bordered w-full max-w-xs">
              <option value="1">Option 1</option>
              <option value="2">Option 2</option>
            </select>
          </div>

          {/* Accept after hours */}
          <div className="form-control">
            <label className="label cursor-pointer justify-start gap-4">
              <input
                type="checkbox"
                checked={acceptAfterHours}
                onChange={(e) => handleAcceptAfterHoursChange(e.target.checked)}
                className="toggle toggle-success"
              />
              <div>
                <span className="label-text font-medium">
                  Accept Queue Patients After Work Hours
                </span>
                <p className="text-xs opacity-60">
                  Warns them if they try to join after hours, but allows them to
                  proceed if they confirm.
                </p>
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* Appearance */}
      <div className={`card bg-base-100 shadow-sm ${styles.outline}`}>
        <div className="card-body gap-4">
          <h2 className="card-title text-lg">Appearance</h2>
          <div className="form-control gap-1">
            <label className="label">
              <span className="label-text font-medium mr-2">Theme</span>
            </label>
            <ThemeController theme={theme} onChange={handleThemeChange} />
          </div>
        </div>
      </div>

      {/* Developer Flags */}
      <div className={`card bg-base-100 shadow-sm ${styles.outline}`}>
        <div className="card-body gap-4">
          <h2 className="card-title text-lg text-warning">Developer Flags</h2>

          {/* Enable Test Pages */}
          <label className={developerFlagRowClass}>
            <div>
              <span className="label-text font-medium">Enable Test Pages</span>
              <p className="text-xs opacity-60">
                Shows testing routes in the sidebar and flow entry points.
              </p>
            </div>
            <input
              type="checkbox"
              checked={developerFlags.ENABLE_TEST_PAGES}
              onChange={(e) =>
                handleFlagChange("ENABLE_TEST_PAGES", e.target.checked)
              }
              className="toggle toggle-warning"
            />
          </label>

          {/* Use Test Date */}
          <label className={developerFlagRowClass}>
            <div>
              <span className="label-text font-medium">Use Test Date</span>
              <p className="text-xs opacity-60">
                Uses the fixed development date/time instead of real-time clock.
              </p>
            </div>
            <input
              type="checkbox"
              checked={developerFlags.USE_TEST_DATE}
              onChange={(e) =>
                handleFlagChange("USE_TEST_DATE", e.target.checked)
              }
              className="toggle toggle-warning"
            />
          </label>

          {/* Test Date and Time */}
          <div className="ml-6 border-l border-base-300 pl-4">
            {/* Test Date */}
            <div className="form-control mb-2">
              <label className="label py-1">
                <span className="label-text font-medium">Date</span>
              </label>
              <input
                type="date"
                value={developerFlags.TEST_DATE_DATE}
                disabled={!isUseTestDateEnabled}
                onChange={(e) => handleTestDateDateChange(e.target.value)}
                className="input input-bordered w-full max-w-xs"
              />
            </div>

            {/* Test Time */}
            <div className="form-control mb-2">
              <label className="label py-1">
                <span className="label-text font-medium">Time (24-hour)</span>
              </label>
              <input
                type="time"
                value={developerFlags.TEST_DATE_TIME}
                disabled={!isUseTestDateEnabled}
                onChange={(e) => handleTestDateTimeChange(e.target.value)}
                className="input input-bordered w-full max-w-xs"
                step={60}
              />
            </div>

            {/* Freeze Time */}
            <label className={developerFlagRowClass}>
              <div>
                <span className="label-text font-medium">Freeze Time</span>
                <p className="text-xs opacity-60">
                  Stops the app clock from ticking while this flag is enabled.
                </p>
              </div>
              <input
                type="checkbox"
                checked={developerFlags.FREEZE_TIME}
                disabled={!isUseTestDateEnabled}
                onChange={(e) =>
                  handleFlagChange("FREEZE_TIME", e.target.checked)
                }
                className="toggle toggle-warning"
              />
            </label>

            {/* Use Time Multiplier */}
            <label className={developerFlagRowClass}>
              <div>
                <span className="label-text font-medium">
                  Use Time Multiplier
                </span>
                <p className="text-xs opacity-60">
                  Speeds up test time progression.
                </p>
              </div>
              <input
                type="checkbox"
                checked={developerFlags.USE_TIME_MULTIPLIER}
                disabled={!isUseTestDateEnabled}
                onChange={(e) =>
                  handleFlagChange("USE_TIME_MULTIPLIER", e.target.checked)
                }
                className="toggle toggle-warning"
              />
            </label>
          </div>

          {/* Bypass Form Validation */}
          <label className={developerFlagRowClass}>
            <div>
              <span className="label-text font-medium">
                Bypass Form Validation
              </span>
              <p className="text-xs opacity-60">
                Skips field validation checks for development/testing only.
              </p>
            </div>
            <input
              type="checkbox"
              checked={developerFlags.BYPASS_FORM_VALIDATION}
              onChange={(e) =>
                handleFlagChange("BYPASS_FORM_VALIDATION", e.target.checked)
              }
              className="toggle toggle-warning"
            />
          </label>
        </div>
      </div>
    </div>
  );
};
