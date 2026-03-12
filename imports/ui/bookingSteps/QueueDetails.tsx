import React from "react";
import { useDateTime } from "/imports/contexts/DateTimeContext";
import {
  CalendarDaysIcon,
  ExclamationTriangleIcon,
  UserIcon,
  WrenchIcon,
} from "@heroicons/react/24/outline";
import { QueueEntry } from "/imports/api/queueEntry";

export const QueueDetails = ({
  entry,
  setOpen,
}: {
  entry: QueueEntry | undefined;
  setOpen: (value: boolean) => void;
}) => {
  const now = useDateTime();

  if (!entry) return null;
  const isPriority = entry.service.priority > 1;

  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs font-semibold text-base-content/50 uppercase tracking-wider">
        Details
      </p>

      {/* Summary rows */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-base-200">
          <UserIcon className="h-4 w-4 text-base-content/40 shrink-0" />
          <span className="text-sm text-base-content/60">Queue ID</span>
          <span className="text-base-content/30">·</span>
          <span className="text-sm font-semibold">
            {entry.displayId ?? "None"}
          </span>
        </div>

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
          <span className="text-sm text-base-content/60">Estimated Time</span>
          <span className="text-base-content/30">·</span>
          <span className="text-sm font-semibold">CALCULATING</span>
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

      <button
        className="btn btn-primary w-full"
        onClick={() => {
          setOpen(false);
        }}
      >
        Confirm
      </button>
    </div>
  );
};
