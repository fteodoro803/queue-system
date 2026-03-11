import React from "react";
import { MODAL_SIZES } from "/imports/utils/modalSizes";
import { useFind, useSubscribe } from "meteor/react-meteor-data";
import { SettingsCollection } from "/imports/api/settings";
import { Loading } from "../components/Loading";
import { setDayStarted } from "/imports/api/settingsMethods";
import { timeStrToLocaleTime } from "/imports/utils/utils";
import { BriefcaseIcon, ClockIcon } from "@heroicons/react/24/outline";

export const WorkdayModal = ({
  setOpen,
}: {
  setOpen: (value: boolean) => void;
}) => {
  const isSettingsLoading = useSubscribe("settings");
  const settings = useFind(() => SettingsCollection.find({}))[0];
  const day_started = settings.day_started;
  const startOfDay: string = settings?.start_of_day;
  const endOfDay: string = settings?.end_of_day;

  if (isSettingsLoading()) {
    return <Loading />;
  }

  const toggleWorkday = async () => {
    if (day_started) {
      await setDayStarted(false);
    } else {
      await setDayStarted(true);
    }

    setOpen(false);
  };

  return (
    <div className="modal modal-open" role="dialog">
      <div className="modal-box relative p-0 overflow-hidden max-w-sm">
        {/* Header */}
        <div className={`px-6 py-5 bg-base-200`}>
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-lg ${day_started ? "bg-success/20 text-success" : "bg-base-300 text-base-content/60"}`}
            >
              <BriefcaseIcon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-none">Workday</h3>
              <p className="text-sm text-base-content/50 mt-0.5">
                {day_started ? "Currently open" : "Currently closed"}
              </p>
            </div>
          </div>

          {/* Close Button */}
          <button
            className="btn btn-circle btn-ghost btn-sm absolute top-3 right-3"
            onClick={() => setOpen(false)}
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 flex flex-col gap-4">
          {/* Hours */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-base-200">
            <ClockIcon className="h-4 w-4 text-base-content/40 shrink-0" />
            <div className="flex justify-between w-full text-sm">
              <span className="text-base-content/60">Working hours</span>
              <span className="font-semibold">
                {`
                ${timeStrToLocaleTime(startOfDay)} - 
                ${timeStrToLocaleTime(endOfDay)}`}
              </span>
            </div>
          </div>

          {/* Status badge */}
          <div
            className={`flex items-center justify-between p-3 rounded-lg ring-1 ${
              day_started
                ? "ring-success/30 bg-success/5"
                : "ring-error/30 bg-error/5"
            }`}
          >
            <span className="text-sm text-base-content/60">Status</span>
            <span
              className={`badge ${day_started ? "badge-success" : "badge-error"} badge-soft`}
            >
              {day_started ? "Open" : "Closed"}
            </span>
          </div>

          {/* Action Button */}
          <button
            className={`btn w-full mt-1 ${day_started ? "btn-error" : "btn-success"}`}
            onClick={toggleWorkday}
          >
            {day_started ? "End Workday" : "Start Workday"}
          </button>
        </div>
      </div>

      <div className="modal-backdrop" onClick={() => setOpen(false)} />
    </div>
  );
};
