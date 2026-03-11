import React from "react";
import { QueueEntry } from "/imports/api/queueEntry";
import { QueueListItemAdmin } from "./QueueListItemAdmin";
import { Service } from "/imports/api/service";
import { QueueListItemPatient } from "./QueueListItemPatient";
import { useDateTime } from "/imports/contexts/DateTimeContext";
import { calculateEstimatedWaitTime } from "/imports/utils/queueUtils";

export const QueueList = ({
  queue,
  service,
  adminView,
}: {
  queue: QueueEntry[];
  service: Service;
  adminView?: boolean;
}) => {
  const now = useDateTime();

  return (
    <ul className="list bg-base-100 rounded-box shadow-md">
      {/* Header */}
      <li
        key={`${service._id}_list_header`}
        className="p-4 pb-2 text-xs opacity-60 tracking-wide"
      >
        {service.name}
      </li>

      {/* List of Queue Entries */}
      {queue.length > 0 ? (
        queue.map((entry) =>
          adminView ? (
            <QueueListItemAdmin
              key={entry._id}
              entry={entry}
              timeUntil={calculateEstimatedWaitTime(entry, queue, service, now)}
            />
          ) : (
            <QueueListItemPatient
              key={entry._id}
              entry={entry}
              timeUntil={calculateEstimatedWaitTime(entry, queue, service, now)}
            />
          ),
        )
      ) : (
        <li className="p-4 text-center text-sm opacity-60">
          No entries in queue
        </li>
      )}
    </ul>
  );
};
