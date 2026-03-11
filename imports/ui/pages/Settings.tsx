import React, { useEffect, useState } from "react";
import { ThemeController } from "../components/ThemeController";
import { useFind, useSubscribe } from "meteor/react-meteor-data";
import { SettingsCollection } from "/imports/api/settings";
import { Loading } from "../components/Loading";
import { setAcceptQueueAfterHours } from "/imports/api/settingsMethods";

// TODO: currently does nothing, implement actual functionality later

export const Settings = () => {
  const isSettingsLoading = useSubscribe("settings");
  const settings = useFind(() => SettingsCollection.find({}))[0];
  const [acceptAfterHours, setAcceptAfterHours] = useState(false);

  useEffect(() => {
    if (settings) setAcceptAfterHours(settings.accept_queue_after_hours);
  }, [settings]);

  const handleAcceptAfterHoursChange = async (value: boolean) => {
    setAcceptAfterHours(value);
    await setAcceptQueueAfterHours(value);
  };

  if (isSettingsLoading()) return <Loading />;

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <h1 className="text-3xl font-bold">Settings</h1>

      {/* Notifications */}
      <div className="card bg-base-100 shadow-sm">
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
      <div className="card bg-base-100 shadow-sm">
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
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body gap-4">
          <h2 className="card-title text-lg">Appearance</h2>
          <div className="form-control gap-1">
            <label className="label">
              <span className="label-text font-medium mr-2">Theme</span>
            </label>
            <ThemeController />
          </div>
        </div>
      </div>
    </div>
  );
};
