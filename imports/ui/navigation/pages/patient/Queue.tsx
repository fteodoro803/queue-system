import React, { useState } from "react";
import { MakeQueueEntryModal } from "/imports/ui/queue/MakeQueueEntryModal";
import { QueueList } from "/imports/ui/queue/QueueList";
import { Loading } from "/imports/ui/components/Loading";
import { useFind, useSubscribe } from "meteor/react-meteor-data";
import { ServicesCollection } from "/imports/api/service";
import { QueueEntryCollection } from "/imports/api/queueEntry";
import { ProviderCollection } from "/imports/api/provider";
import { Patient, PatientsCollection } from "/imports/api/patient";

export const Queue = () => {
  const [isModalOpen, setModalOpen] = useState<boolean>(false);

  const isQueueEntryLoading = useSubscribe("queue");
  const queueEntries = useFind(() =>
    QueueEntryCollection.find({}, { sort: { serviceId: 1, position: 1 } }),
  );

  const isServicesLoading = useSubscribe("services");
  const services = useFind(() => ServicesCollection.find());

  const isProvidersLoading = useSubscribe("providers");
  const providers = useFind(() => ProviderCollection.find({}));

  const patientIds = queueEntries.map((e) => e.patientId);
  const isPatientsLoading = useSubscribe("patients.byIds", patientIds);
  const patients = useFind(
    () => PatientsCollection.find({ _id: { $in: patientIds } }),
    [queueEntries.length],
  );
  const patientMap: Map<string, Patient> = new Map(
    patients.map((p) => [p._id, p]),
  );

  if (
    isQueueEntryLoading() ||
    isServicesLoading() ||
    isProvidersLoading() ||
    isPatientsLoading()
  ) {
    return <Loading />;
  }

  return (
    <>
      <div className="flex justify-between">
        <h1 className="text-3xl font-bold">Queue</h1>
        <div className="flex gap-1">
          <button
            className="btn btn-primary"
            onClick={() => setModalOpen(true)}
          >
            + Join Queue
          </button>
        </div>
      </div>

      {/* Queue Status for each Service */}
      <div>
        {services.map((service) => {
          const serviceQueue = queueEntries.filter(
            (entry) =>
              entry.serviceId === service._id &&
              (entry.status === "waiting" ||
                entry.status === "ready" ||
                entry.status === "in-progress"),
          );
          const activeProviders = providers.filter((p) =>
            p.services.some((s) => s.id === service._id && s.enabled),
          ).length;
          return (
            <div key={service._id} className="mb-6">
              <h2 className="text-2xl font-bold">{service.name}</h2>
              <QueueList
                queue={serviceQueue}
                service={service}
                activeProviders={activeProviders}
                patientMap={patientMap}
              />
            </div>
          );
        })}

        {/* Join Queue Modal */}
        {isModalOpen && <MakeQueueEntryModal setOpen={setModalOpen} />}
      </div>
    </>
  );
};
