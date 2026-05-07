import React, { useEffect, useState } from "react";
import { MakeQueueEntryModal } from "/imports/ui/queue/MakeQueueEntryModal";
import { ProviderAvailabilityModal } from "/imports/ui/provider/ProviderAvailabilityModal";
import { useFind, useSubscribe } from "meteor/react-meteor-data";
import { Loading } from "/imports/ui/components/Loading";
import { QueueEntry, QueueEntryCollection } from "/imports/api/queueEntry";
import { QueueList } from "/imports/ui/queue/QueueList";
import { Service, ServicesCollection } from "/imports/api/service";
import { DashboardCard } from "/imports/ui/components/DashboardCard";
import {
  ClockIcon,
  IdentificationIcon,
  NumberedListIcon,
} from "@heroicons/react/24/outline";
import {
  convertMillisecondsToTime,
  convertMinutesToTime,
  getEndOfWorkDay,
} from "/imports/utils/utils";
import { useDateTime } from "/imports/contexts/DateTimeContext";
import { Settings, SettingsCollection } from "/imports/api/settings";
import { ProviderCollection } from "/imports/api/provider";
import { Patient, PatientsCollection } from "/imports/api/patient";
import { calculateQueueTime, QueueTimeResult } from "/imports/utils/queueUtils";
import { ServiceSelector } from "/imports/ui/components/ServiceSelector";
import { getStatsQuery } from "/imports/api/statsMethods";

export const QueueManagement = () => {
  const now = useDateTime();
  const isQueueEntryLoading = useSubscribe("queue");
  const presentQueueEntries: QueueEntry[] = useFind(() =>
    QueueEntryCollection.find(
      { status: { $in: ["in-progress", "waiting", "ready"] } },
      { sort: { serviceId: 1, position: 1 } },
    ),
  );
  const pastQueueEntries: QueueEntry[] = useFind(() =>
    QueueEntryCollection.find(
      { status: { $in: ["completed", "cancelled"] } },
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

  const [queueEntryModalOpen, setQueueEntryModalOpen] =
    useState<boolean>(false);
  const [providerAvailabilityModalOpen, setProviderAvailabilityModalOpen] =
    useState<boolean>(false);

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

  const maxQueueLength: QueueTimeResult | undefined =
    selectedService && stats
      ? calculateQueueTime({
          providers,
          currentTime: now,
          queue: presentQueueEntries,
          service: selectedService,
          stats: stats.length > 0 ? stats[0] : undefined,
        })
      : undefined;

  const isSettingsLoading = useSubscribe("settings");
  const settings = useFind(() => SettingsCollection.find({}))[0] as Settings;

  if (
    isQueueEntryLoading() ||
    isServicesLoading() ||
    isProvidersLoading() ||
    isPatientsLoading() ||
    isSettingsLoading() ||
    isStatsLoading()
  ) {
    return <Loading />;
  }

  // Data for Queue Time dashboard Card
  const endOfDay = getEndOfWorkDay(now, settings.end_of_day);
  const timeRemainingMs = endOfDay.getTime() - now.getTime(); // in milliseconds
  const formattedTimeRemaining = convertMillisecondsToTime(timeRemainingMs);
  const maxQueueLengthMs: number | undefined =
    maxQueueLength && maxQueueLength.ok
      ? maxQueueLength.time * 60 * 1000
      : undefined; // convert mins to ms

  const getQueueTimeColor = () => {
    if (maxQueueLengthMs && maxQueueLengthMs >= timeRemainingMs)
      return "text-error";
    if (maxQueueLengthMs && maxQueueLengthMs >= timeRemainingMs * 0.5)
      return "text-warning";
    return "";
  };

  return (
    <>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-4">
        <h1 className="text-3xl font-bold">Queue Management</h1>
        <button
          className="btn btn-primary w-full sm:w-auto"
          onClick={() => setQueueEntryModalOpen(true)}
        >
          + Join Queue
        </button>
      </div>

      {selectedService && (
        <>
          {/* Dashboard Cards */}
          <div className="flex flex-wrap gap-4 justify-start my-8">
            {/* Queue Card */}
            <div>
              <DashboardCard
                header="In Queue"
                body={
                  presentQueueEntries.filter(
                    (q) => q.status === "waiting" || q.status === "ready",
                  ).length
                }
                footer={`Completed: ${presentQueueEntries.filter((q) => q.status === "completed").length}`}
                icon={NumberedListIcon}
              />
            </div>

            {/* Available Providers Card */}
            <div
              className="cursor-pointer"
              onClick={() => setProviderAvailabilityModalOpen(true)}
            >
              <DashboardCard
                header="Available Providers"
                body={availableProviders}
                footer={`Unavailable: ${unavailableProviders}`}
                icon={IdentificationIcon}
              />
            </div>

            {/* Queue Time Card */}
            {/* Total Service time is total queue time + service duration for last entry in queue */}
            <div>
              <DashboardCard
                header="Est. Service Time"
                body={
                  maxQueueLength && maxQueueLength.ok
                    ? convertMinutesToTime(maxQueueLength.time)
                    : `ERROR (${maxQueueLength ? maxQueueLength.reason : "undefined"})`
                }
                footer={
                  <p className={getQueueTimeColor()}>
                    {formattedTimeRemaining} left in day
                  </p>
                }
                icon={ClockIcon}
              />
            </div>
          </div>
        </>
      )}

      <ServiceSelector
        services={services}
        selectedService={selectedService}
        setService={setSelectedService}
      />

      {/* Tab Groups */}
      {/* name of each tab group should be unique */}
      <div className="tabs tabs-border justify-center mt-4">
        {/* Upcoming and Ongoing Queue Entries */}
        <input
          type="radio"
          name="my_tabs_2"
          className="tab"
          aria-label="Upcoming"
          defaultChecked
        />

        {/* Upcoming and Ongoing Queue */}
        <div className="tab-content border-base-300 bg-base-100 p-4 sm:p-10">
          {selectedService ? (
            <div className={"flex flex-col gap-4"}>
              <div className="">
                <div key={selectedService._id} className="mb-6">
                  <h2 className="text-2xl font-bold">Ongoing</h2>
                  <QueueList
                    queue={presentQueueEntries}
                    service={selectedService}
                    providers={activeProviders}
                    states={["in-progress"]}
                    patientMap={patientMap}
                    adminView={true}
                  />
                </div>
              </div>

              <div className="">
                <div key={selectedService._id} className="mb-6">
                  <h2 className="text-2xl font-bold">Waiting</h2>
                  <QueueList
                    queue={presentQueueEntries}
                    service={selectedService}
                    availableProviders={availableProviders}
                    states={["waiting", "ready"]}
                    providers={activeProviders}
                    patientMap={patientMap}
                    adminView={true}
                    stats={stats && stats.length > 0 ? stats[0] : undefined}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-sm opacity-60">
              No services available.
            </div>
          )}
        </div>

        {/* Finished Queue Entries */}
        <input
          type="radio"
          name="my_tabs_2"
          className="tab"
          aria-label="Finished"
        />
        <div className="tab-content border-base-300 bg-base-100 p-4 sm:p-10">
          {selectedService ? (
            <>
              <div className="">
                <div key={selectedService._id} className="mb-6">
                  <h2 className="text-2xl font-bold">Finished</h2>
                  <QueueList
                    availableProviders={availableProviders}
                    queue={pastQueueEntries}
                    service={selectedService}
                    states={["completed"]}
                    providers={activeProviders}
                    patientMap={patientMap}
                    adminView={true}
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="py-8 text-center text-sm opacity-60">
              No services available.
            </div>
          )}
        </div>

        {/* Cancelled Queue Entries */}
        <input
          type="radio"
          name="my_tabs_2"
          className="tab"
          aria-label="Cancelled"
        />
        <div className="tab-content border-base-300 bg-base-100 p-4 sm:p-10">
          {selectedService ? (
            <>
              <div className="">
                <div key={selectedService._id} className="mb-6">
                  <h2 className="text-2xl font-bold">Cancelled</h2>
                  <QueueList
                    availableProviders={availableProviders}
                    queue={pastQueueEntries}
                    service={selectedService}
                    states={["cancelled"]}
                    providers={activeProviders}
                    patientMap={patientMap}
                    adminView={true}
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="py-8 text-center text-sm opacity-60">
              No services available.
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {queueEntryModalOpen && (
        <MakeQueueEntryModal setOpen={setQueueEntryModalOpen} />
      )}

      <ProviderAvailabilityModal
        open={providerAvailabilityModalOpen}
        setOpen={setProviderAvailabilityModalOpen}
      />
    </>
  );
};
