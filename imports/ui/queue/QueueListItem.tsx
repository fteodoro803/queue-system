import React from "react";
import { QueueEntry } from "/imports/api/queueEntry";
import {
  cancelService,
  completeService,
  startService,
} from "/imports/api/queueEntryMethods";
import {
  ClipboardDocumentListIcon,
  PlayIcon,
  StopIcon,
  XMarkIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { useDateTime } from "/imports/contexts/DateTimeContext";
import { QueueIcon } from "../components/QueueIcon";
import { formatDateToLocale } from "/imports/utils/utils";

export const QueueListItem = ({ entry }: { entry: QueueEntry }) => {
  const now = useDateTime();
  const iconSize: string = "size-6";
  const textSize: string = "text-sm";

  const statusBadgeMap: Record<string, string> = {
    waiting: "badge-info",
    "in-progress": "badge-warning",
    completed: "badge-success",
    cancelled: "badge-error",
  };

  return (
    <li className="list-row hover:bg-base-200" key={entry._id}>
      {/* Icon */}
      <div className="tabular-nums">
        <QueueIcon entry={entry} />
      </div>

      {/* Details Column */}
      <div className="list-col-grow py-1">
        {/* Patient Name */}
        <div className="card-title">{entry.patient.name}</div>

        {/* Body */}
        <div className="flex items-center gap-4 py-1">
          {/* Service */}
          <div className="flex items-center gap-1">
            <ClipboardDocumentListIcon className={iconSize} />
            <p className={textSize}>{entry.service.name ?? "N/A"}</p>
          </div>

          {/* Started */}
          {entry.start && !entry.end && (
            <div className="flex items-center gap-1">
              <ClockIcon className={iconSize} />
              <p className={textSize}>
                {entry.start
                  ? `${formatDateToLocale(entry.start)}-present`
                  : "N/A"}
              </p>
            </div>
          )}

          {/* Completed */}
          {entry.start && entry.end && (
            <div className="flex items-center gap-1">
              <ClockIcon className={iconSize} />
              <p className={textSize}>
                {entry.start && entry.end
                  ? `${formatDateToLocale(entry.start)}-${formatDateToLocale(entry.end)}`
                  : "N/A"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Buttons and Status Badge*/}
      <div className="flex items-center">
        {/* Status */}
        <div
          className={`badge badge-soft ml-auto ${statusBadgeMap[entry.status]}`}
        >
          {entry.status}
        </div>

        {/* Start Button */}
        <button
          className="btn btn-square btn-ghost"
          onClick={() => {
            startService(entry._id, now);
          }}
        >
          <PlayIcon className="w-6" />
        </button>
        {/* Complete Button */}
        <button
          className="btn btn-square btn-ghost"
          onClick={() => completeService(entry._id, now)}
        >
          <StopIcon className="w-6" />
        </button>
        {/* Cancel Button */}
        <button
          className="btn btn-square btn-ghost"
          onClick={() => cancelService(entry._id, now)}
        >
          <XMarkIcon className="w-6" />
        </button>
      </div>
    </li>
  );
};
