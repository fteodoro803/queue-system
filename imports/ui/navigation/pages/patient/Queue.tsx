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
import { getStatsQuery } from "/imports/api/statsMethods";
import { useDateTime } from "/imports/contexts/DateTimeContext";
import { DashboardCard } from "/imports/ui/components/DashboardCard";
import {
  IdentificationIcon,
  NumberedListIcon,
} from "@heroicons/react/24/outline";

export const Queue = () => {
  const now = useDateTime();
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
  let providers = useFind(
    () =>
      selectedService
        ? ProviderCollection.find({
            services: {
              $elemMatch: { id: selectedService._id, enabled: true },
            },
          })
        : ProviderCollection.find({}),
    [selectedService?._id],
  );

  // TODO: fetch patients relevant to the queue entries
  const isPatientsLoading = useSubscribe("patients");
  const patients = useFind(() => PatientsCollection.find({}));
  const patientMap: Map<string, Patient> = new Map(
    patients.map((p) => [p._id, p]),
  );

  const isStatsLoading = useSubscribe("stats");
  const stats = useFind(
    () =>
      selectedService ? getStatsQuery(selectedService._id, now) : undefined,
    [selectedService],
  );

  const totalProviders = providers.filter((p) =>
    p.services.some((s) => s.id === selectedService?._id && s.enabled),
  );

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

  // Update providers based on selected service
  useEffect(() => {
    if (!selectedService) return;

    providers = providers.filter((provider) =>
      provider.services.some((service) => service.id === selectedService._id),
    );
  }, [selectedService]);

  const activeProviders = providers.filter(
    (p) =>
      p.active &&
      p.services.some((s) => s.id === selectedService?._id && s.enabled),
  );
  const availableProviders = providers.filter((p) => p.available).length;
  const unavailableProviders = activeProviders.length - availableProviders;

  if (
    isQueueEntryLoading() ||
    isServicesLoading() ||
    isProvidersLoading() ||
    isPatientsLoading() ||
    isStatsLoading()
  ) {
    return <Loading />;
  }

  return (
    <>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-4">
        <h1 className="text-3xl font-bold">Queue</h1>
        <div className="flex gap-1">
          <button
            className="btn btn-primary w-full sm:w-auto"
            onClick={() => setModalOpen(true)}
          >
            + Join Queue
          </button>
        </div>
      </div>

      {/* Cards */}
      {selectedService && (
        <>
          {/* Dashboard Cards */}
          <div className="flex flex-wrap gap-4 justify-start my-8">
            {/* Queue Card */}
            <div>
              <DashboardCard
                header="In Queue"
                body={
                  queueEntries.filter(
                    (q) => q.status === "waiting" || q.status === "ready",
                  ).length
                }
                footer={`Completed: ${queueEntries.filter((q) => q.status === "completed").length}`}
                icon={NumberedListIcon}
              />
            </div>

            {/* Available Providers Card */}
            <div>
              <DashboardCard
                header="Available Providers"
                body={availableProviders}
                footer={`Unavailable: ${unavailableProviders}`}
                icon={IdentificationIcon}
              />
            </div>
          </div>{" "}
        </>
      )}

      <div className={"mt-4"}>
        <ServiceSelector
          services={services}
          selectedService={selectedService}
          setService={setSelectedService}
        />
      </div>

      {/* Queue Status for each Service */}
      {selectedService ? (
        <div key={selectedService._id} className="mb-6 mt-6">
          <QueueList
            queue={queueEntries}
            service={selectedService}
            providers={totalProviders}
            patientMap={patientMap}
            states={["in-progress", "waiting", "ready"]}
            adminView={false}
            stats={stats && stats.length > 0 ? stats[0] : undefined}
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
