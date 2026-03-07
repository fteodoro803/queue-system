import React from "react";
import { QueueEntry } from "/imports/api/queueEntry";
import { QueueListItemAdmin } from "./QueueListItemAdmin";
import { Service } from "/imports/api/service";
import { QueueListItemPatient } from "./QueueListItemPatient";

export const QueueList = ({
  queue,
  service,
  adminView,
}: {
  queue: QueueEntry[];
  service: Service;
  adminView?: boolean;
}) => {
  // Get current time for calculating waiting times, etc.
  // TODO: account for if there are two or more available providers
  const avgServiceDuration: number = service.avgDuration ?? service.duration; // Fallback to service duration if avgDuration is not provided

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
            <QueueListItemAdmin key={entry._id} entry={entry} />
          ) : (
            <QueueListItemPatient key={entry._id} entry={entry} serviceDuration={avgServiceDuration} />
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
