import React from "react";
import { QueueEntry } from "/imports/api/queueEntry";
import { QueueListItem } from "./QueueListItem";
import { Service } from "/imports/api/service";
import { useDateTime } from "/imports/contexts/DateTimeContext";
import { calculateQueueTime } from "/imports/utils/queueUtils";
import { Patient } from "/imports/api/patient";

export const QueueList = ({
  queue,
  service,
  activeProviders,
  patientMap,
  adminView,
  availableProviders,
}: {
  queue: QueueEntry[];
  service: Service;
  activeProviders: number;
  patientMap: Map<string, Patient>;
  adminView?: boolean;
  availableProviders?: number;
}) => {
  const now = useDateTime();

  // Filter queue for entries of this service
  const filteredQueue = queue
    .filter((entry) => entry.serviceId === service._id)
    .filter((entry) => patientMap.has(entry.patientId));

  return (
    <ul className="list bg-base-100 rounded-box shadow-md">
      {/* Header */}
      <li
        key={`${service._id}_list_header`}
        className="p-4 pb-2 text-xs opacity-60 tracking-wide"
      >
        {/* {service.name} */}
      </li>

      {/* List of Queue Entries */}
      {filteredQueue.length > 0 ? (
        filteredQueue.map((entry) => {
          const estimatedWaitTime = calculateQueueTime({
            queue: filteredQueue,
            queueEntry: entry,
            service: service,
            activeProviders: activeProviders,
            currentTime: now,
          });

          return (
            <QueueListItem
              key={entry._id}
              entry={entry}
              patient={patientMap.get(entry.patientId)!}
              service={service}
              timeUntil={estimatedWaitTime}
              availableProviders={availableProviders}
              admin={adminView}
            />
          );
        })
      ) : (
        <li className="p-4 text-center text-sm opacity-60">
          No entries in queue
        </li>
      )}
    </ul>
  );
};
