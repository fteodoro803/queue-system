import React from "react";
import { QueueEntry } from "/imports/api/queueEntry";
import { QueueListItem } from "./QueueListItem";
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
            <QueueListItem key={entry._id} entry={entry} />
          ) : (
            <QueueListItemPatient key={entry._id} entry={entry} />
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
