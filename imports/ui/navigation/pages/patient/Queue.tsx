import React, { useEffect, useState } from "react";
import { MakeQueueEntryModal } from "/imports/ui/queue/MakeQueueEntryModal";
import { QueueList } from "/imports/ui/queue/QueueList";
import { Loading } from "/imports/ui/components/Loading";
import { useFind, useSubscribe } from "meteor/react-meteor-data";
import { Service, ServicesCollection } from "/imports/api/service";
import { QueueEntryCollection } from "/imports/api/queueEntry";
import { ProviderCollection } from "/imports/api/provider";
import { Patient, PatientsCollection } from "/imports/api/patient";
import { ServiceSelector } from "/imports/ui/components/ServiceSelector";

export const Queue = () => {
  const [isModalOpen, setModalOpen] = useState<boolean>(false);

  const isQueueEntryLoading = useSubscribe("queue");
  const queueEntries = useFind(() =>
    QueueEntryCollection.find(
      { status: { $in: ["in-progress", "waiting", "ready"] } },
      { sort: { serviceId: 1, position: 1 } },
    ),
  );

  const isServicesLoading = useSubscribe("services");
  const services = useFind(() => ServicesCollection.find());
  const [selectedService, setSelectedService] = useState<Service | undefined>();

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

  const totalProviders = providers.filter((p) =>
    p.services.some((s) => s.id === selectedService?._id && s.enabled),
  ).length;

  // ---- Effects ----
  // Select the first service by default when services are loaded
  useEffect(() => {
    if (services.length === 0) {
      setSelectedService(undefined);
      return;
    }

    setSelectedService((currentService) => {
      if (!currentService) return services[0];

      // Keep selection by id, but return the latest reactive object
      const updatedService = services.find(
        (service) => service._id === currentService._id,
      );
      return updatedService ?? services[0];
    });
  }, [services]);

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

      <ServiceSelector
        services={services}
        selectedService={selectedService}
        setService={setSelectedService}
      />

      {/* Queue Status for each Service */}
      {selectedService ? (
        <div key={selectedService._id} className="mb-6 mt-6">
          <QueueList
            queue={queueEntries}
            service={selectedService}
            activeProviders={totalProviders}
            patientMap={patientMap}
            adminView={false}
          />
        </div>
      ) : (
        <div className="py-8 text-center text-sm opacity-60">
          No services available.
        </div>
      )}

      {/* Join Queue Modal */}
      {isModalOpen && <MakeQueueEntryModal setOpen={setModalOpen} />}
    </>
  );
};
