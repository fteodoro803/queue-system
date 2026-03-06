import React from "react";
import { QueueEntry } from "/imports/api/queueEntry";
import { formatDateToLocale } from "/imports/utils/utils";
import { cancelService, completeService, startService } from "/imports/api/queueEntryMethods";
import { PlayIcon, StopIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useDateTime } from "/imports/contexts/DateTimeContext";

export const QueueList = ({ queue }: { queue: QueueEntry[] }) => {
  const now = useDateTime();

  return (
    <ul className="list bg-base-100 rounded-box shadow-md">
      <li className="p-4 pb-2 text-xs opacity-60 tracking-wide">Queue</li>

      {queue.map((entry) => (
        <li className="list-row" key={entry._id}>
          <div className="text-4xl font-thin opacity-30 tabular-nums">
            {entry.position !== null ? entry.position : "--"}
          </div>
          <div className="list-col-grow">
            <div>{entry.patient.name}</div>
            <div className="text-xs uppercase font-semibold opacity-60">
              {entry.service.name} | {entry.status} |
              {`(${entry.start ? formatDateToLocale(entry.start) : "--"} - ${entry.end ? formatDateToLocale(entry.end) : "--"})`}
            </div>
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
        </li>
      ))}
    </ul>
  );
};
