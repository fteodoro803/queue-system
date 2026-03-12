import React from "react";
import { useDateTime } from "/imports/contexts/DateTimeContext";
import {
  CalendarDaysIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  WrenchIcon,
} from "@heroicons/react/24/outline";
import { QueueEntry } from "/imports/api/queueEntry";
import { Session } from "meteor/session";
import { useTracker } from "meteor/react-meteor-data";
import { convertMinutesToTime } from "/imports/utils/utils";

export const QueueDetails = ({
  entry,
  setOpen,
}: {
  entry: QueueEntry | undefined;
  setOpen: (value: boolean) => void;
}) => {
  const now = useDateTime();

  // TODO: temporary? probably should be calculated on the server and stored somewhere
  const maxQueueLength = useTracker(
    () => Session.get("maxQueueLength") || null,
  );

  if (!entry) return null;
  const isPriority = entry.service.priority > 1;

  return (
    <div className="flex flex-col gap-4">
      {/* Joined Queue Alert */}
      <div role="alert" className="alert alert-success">
        <CheckCircleIcon className="h-6 w-6" />
        <span>
          You have joined the queue in{" "}
          <strong>position {entry.position}</strong>!
        </span>
      </div>

      {/* Queue ID Hero */}
      <div className="flex flex-col items-center py-6 gap-1">
        <p className="text-xs font-semibold text-base-content/40 uppercase tracking-widest">
          Queue ID
        </p>
        <p className="text-7xl font-black">{entry.displayId ?? "—"}</p>
        <div className="flex items-center gap-1.5 mt-2 text-base-content/50">
          <CalendarDaysIcon className="h-4 w-4" />
          <span className="text-sm">
            Est. wait:{" "}
            <span className="font-semibold text-base-content">
              {convertMinutesToTime(maxQueueLength)}
            </span>
          </span>
        </div>
      </div>

      {/* Divider */}
      <div className="divider text-xs text-base-content/30 uppercase tracking-wider">
        Details
      </div>

      {/* Summary rows */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-base-200">
          <WrenchIcon className="h-4 w-4 text-base-content/40 shrink-0" />
          <span className="text-sm text-base-content/60">Service</span>
          <span className="text-base-content/30">·</span>
          <span className="text-sm font-semibold">
            {entry.service?.name ?? "None"}
          </span>
        </div>

        <div className="flex items-center gap-3 p-3 rounded-lg bg-base-200">
          <CalendarDaysIcon className="h-4 w-4 text-base-content/40 shrink-0" />
          <span className="text-sm text-base-content/60">Date</span>
          <span className="text-base-content/30">·</span>
          <span className="text-sm font-semibold">
            {now.toLocaleDateString(undefined, {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        </div>
      </div>

      {/* Priority warning */}
      {isPriority && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-error/10 ring-1 ring-error/30 text-error">
          <ExclamationTriangleIcon className="h-4 w-4 shrink-0" />
          <span className="text-sm font-medium">
            This is a high-priority service
          </span>
        </div>
      )}

      <button className="btn btn-primary w-full" onClick={() => setOpen(false)}>
        Close
      </button>
    </div>
  );
};
