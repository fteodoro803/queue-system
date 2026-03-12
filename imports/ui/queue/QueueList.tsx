import React from "react";
import { QueueEntry } from "/imports/api/queueEntry";
import { QueueListItemAdmin } from "./QueueListItemAdmin";
import { Service } from "/imports/api/service";
import { QueueListItemPatient } from "./QueueListItemPatient";
import { useDateTime } from "/imports/contexts/DateTimeContext";
import { calculateEstimatedWaitTime } from "/imports/utils/queueUtils";
import { useFind, useSubscribe, useTracker } from "meteor/react-meteor-data";
import { ProviderCollection } from "/imports/api/provider";
import { Loading } from "../components/Loading";
import { Session } from "meteor/session";

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

  // Get number of Providers for this service to calculate wait times
  const providersIsLoading = useSubscribe("providers");
  const providers = useFind(() =>
    ProviderCollection.find({
      services: { $elemMatch: { id: service._id, enabled: true } },
    }),
  );

  const maxQueueLength = useTracker(
    () => Session.get("maxQueueLength") || null,
  );

  if (providersIsLoading()) return <Loading />;

  console.log(
    `Rendering QueueList for service ${service.name} with ${queue.length} entries and ${providers.length} providers`,
  );

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
        queue.map((entry) => {
          const estimatedWaitTime = calculateEstimatedWaitTime(
            entry,
            queue,
            service,
            providers.length,
            now,
          );
          if (estimatedWaitTime && estimatedWaitTime > maxQueueLength)
            Session.set("maxQueueLength", estimatedWaitTime);

          if (adminView)
            return (
              <QueueListItemAdmin
                key={entry._id}
                entry={entry}
                timeUntil={estimatedWaitTime}
              />
            );
          else
            return (
              <QueueListItemPatient
                key={entry._id}
                entry={entry}
                timeUntil={estimatedWaitTime}
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
