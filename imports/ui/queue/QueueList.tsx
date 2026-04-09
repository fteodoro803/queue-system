import React from "react";
import { QueueEntry } from "/imports/api/queueEntry";
import { QueueListItem } from "./QueueListItem";
import { Service } from "/imports/api/service";
import { useDateTime } from "/imports/contexts/DateTimeContext";
import { calculateQueueTime } from "/imports/utils/queueUtils";
import { useFind, useSubscribe } from "meteor/react-meteor-data";
import { ProviderCollection } from "/imports/api/provider";
import { Loading } from "/imports/ui/components/Loading";
import { Patient, PatientsCollection } from "/imports/api/patient";

export const QueueList = ({
  queue,
  service,
  adminView,
  availableProviders,
}: {
  queue: QueueEntry[];
  service: Service;
  adminView?: boolean;
  availableProviders?: number;
}) => {
  const now = useDateTime();

  // Get number of Providers for this service to calculate wait times
  const isProvidersLoading = useSubscribe("providers");
  const providers = useFind(() =>
    ProviderCollection.find({
      services: { $elemMatch: { id: service._id, enabled: true } },
    }),
  );

  // Filter queue for entries of this service
  const filteredQueue = queue.filter(
    (entry) => entry.serviceId === service._id,
  );

  // Get patients in filtered queue
  const isPatientsLoading = useSubscribe("patients");
  const patientIds = filteredQueue.map((entry) => entry.patientId);
  const patients = useFind(() =>
    PatientsCollection.find({ _id: { $in: patientIds } }),
  );
  const patientMap: Map<string, Patient> = new Map(
    patients.map((p) => [p._id, p]),
  );

  if (isProvidersLoading() || isPatientsLoading()) return <Loading />;

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
            activeProviders: providers.length,
            currentTime: now,
          });

          if (adminView)
            return (
              <QueueListItem
                key={entry._id}
                entry={entry}
                patient={patientMap.get(entry.patientId)!}
                service={service}
                timeUntil={estimatedWaitTime}
                availableProviders={availableProviders}
                admin={true}
              />
            );
          else
            return (
              // TODO: Match this later with admin one, or merge it
              <QueueListItem
                key={entry._id}
                entry={entry}
                patient={patientMap.get(entry.patientId)!}
                service={service}
                timeUntil={estimatedWaitTime}
                availableProviders={availableProviders}
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
