import React from "react";
import { QueueEntry } from "/imports/api/queueEntry";
import {
  ClipboardDocumentListIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { QueueIcon } from "/imports/ui/components/QueueIcon";
import { formatDateToLocale } from "/imports/utils/utils";

export const QueueListItemPatient = ({
  entry,
  timeUntil,
}: {
  entry: QueueEntry;
  timeUntil?: number;
}) => {
  const iconSize: string = "size-6";
  const textSize: string = "text-sm";

  const statusBadgeMap: Record<string, string> = {
    waiting: "badge-info",
    "in-progress": "badge-success",
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
        <div className="card-title">{entry.displayId}</div>

        {/* Body */}
        <div className="flex items-center gap-4 py-1">
          {/* Service */}
          <div className="flex items-center gap-1">
            <ClipboardDocumentListIcon className={iconSize} />
            <p className={textSize}>{entry.service.name ?? "N/A"}</p>
          </div>

          {/* Estimated Time Until */}
          {entry.status === "waiting" && timeUntil != undefined && (
            <div className="flex items-center gap-1">
              <ClockIcon className={iconSize} />
              <p className={textSize}>
                {timeUntil > 0 ? `est. ${timeUntil} min` : "delayed"}
              </p>
            </div>
          )}

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

      {/* Status */}
      <div className="flex items-center">
        <div
          className={`badge badge-soft ml-auto ${statusBadgeMap[entry.status]}`}
        >
          {entry.status}
        </div>
      </div>
    </li>
  );
};
