import React, {
  Dispatch,
  SetStateAction,
  useEffect,
  useMemo,
  useState,
} from "react";
import { MakeQueueEntryModal } from "/imports/ui/queue/MakeQueueEntryModal";
import { useFind, useSubscribe } from "meteor/react-meteor-data";
import { Loading } from "/imports/ui/components/Loading";
import { QueueEntryCollection } from "/imports/api/queueEntry";
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
import { SettingsCollection } from "/imports/api/settings";
import { resetCounter } from "/imports/api/countersMethods";
import { ProviderCollection } from "/imports/api/provider";
import { calculateQueueTime } from "/imports/utils/queueUtils";

export const QueueManagement = () => {
  const now = useDateTime();
  const isQueueEntryLoading = useSubscribe("queue");
  const queueEntries = useFind(() =>
    QueueEntryCollection.find({}, { sort: { serviceId: 1, position: 1 } }),
  );

  const isServicesLoading = useSubscribe("services");
  const services = useFind(() => ServicesCollection.find());
  const [selectedService, setSelectedService] = useState<Service | undefined>();

  const isProvidersLoading = useSubscribe("providers");
  const providers = useFind(() => ProviderCollection.find({}));

  const [queueEntryModalOpen, setQueueEntryModalOpen] =
    useState<boolean>(false);

  // Select the first service by default when services are loaded
  useEffect(() => {
    if (services.length === 0) {
      setSelectedService(undefined);
      return;
    }

    setSelectedService((currentService) => {
      if (
        currentService &&
        services.some((service) => service._id === currentService._id)
      ) {
        return currentService;
      }

      return services[0];
    });
  }, [services]);

  const [ongoing, waiting, cancelled, finished] = useMemo(() => {
    const ongoing = queueEntries.filter(
      (entry) => entry.status === "in-progress",
    );
    const waiting = queueEntries.filter(
      (entry) => entry.status === "waiting" || entry.status === "ready",
    );
    const cancelled = queueEntries.filter(
      (entry) => entry.status === "cancelled",
    );
    const finished = queueEntries.filter(
      (entry) => entry.status === "completed",
    );
    return [ongoing, waiting, cancelled, finished];
  }, [queueEntries]);

  // TODO: Currently doesnt account for specific services, this is just assuming 1 service
  const totalProviders = providers.length;
  const unavailableProviders = ongoing?.length;
  const availableProviders = totalProviders - unavailableProviders;

  const maxQueueLength = selectedService
    ? calculateQueueTime({
        activeProviders: totalProviders,
        currentTime: now,
        queue: queueEntries,
        service: selectedService,
      })
    : undefined;

  const isSettingsLoading = useSubscribe("settings");
  const settings = useFind(() => SettingsCollection.find({}))[0];

  if (
    isQueueEntryLoading() ||
    isServicesLoading() ||
    isProvidersLoading() ||
    isSettingsLoading()
  ) {
    return <Loading />;
  }

  // Data for Queue Time dashboard Card
  const endOfDay = getEndOfWorkDay(now, settings.end_of_day);
  const timeRemainingMs = endOfDay.getTime() - now.getTime(); // in milliseconds
  const formattedTimeRemaining = convertMillisecondsToTime(timeRemainingMs);
  const maxQueueLengthMs: number | undefined = maxQueueLength
    ? maxQueueLength * 60 * 1000
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
      <div className="flex justify-between">
        <h1 className="text-3xl font-bold">Queue Management</h1>
        <div className="flex gap-1">
          {/* TODO: move this to queue management settings later? */}
          <button
            className="btn btn-primary"
            onClick={async () => {
              await resetCounter();
            }}
          >
            - Clear Counter
          </button>
          <button
            className="btn btn-primary"
            onClick={() => setQueueEntryModalOpen(true)}
          >
            + Join Queue
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 justify-start mt-6">
        <div className="my-4">
          <DashboardCard
            header="In Queue"
            body={queueEntries.filter((q) => q.status === "waiting").length}
            footer={`Completed: ${queueEntries.filter((q) => q.status === "completed").length}`}
            icon={NumberedListIcon}
          />
        </div>

        {/* Available Doctors Card */}
        <div className="my-4">
          <DashboardCard
            header="Available Providers"
            body={availableProviders}
            footer={`Unavailable: ${unavailableProviders}`}
            icon={IdentificationIcon}
          />
        </div>

        {/* Queue Time Card */}
        {/* Total Service time is total queue time + service duration for last entry in queue */}
        <div className="my-4">
          <DashboardCard
            header="Est. Service Time"
            body={maxQueueLength ? convertMinutesToTime(maxQueueLength) : "N/A"}
            footer={
              <p className={getQueueTimeColor()}>
                {formattedTimeRemaining} left in day
              </p>
            }
            icon={ClockIcon}
          />
        </div>
      </div>

      <ServiceSelector
        services={services}
        selectedService={selectedService}
        setService={setSelectedService}
      />

      {/* Tab Groups */}
      {/* name of each tab group should be unique */}
      <div className="tabs tabs-border justify-center">
        {/* Upcoming and Ongoing Queue Entries */}
        <input
          type="radio"
          name="my_tabs_2"
          className="tab"
          aria-label="Upcoming"
          defaultChecked
        />

        <div className="tab-content border-base-300 bg-base-100 p-10">
          {selectedService ? (
            <>
              <div className="">
                <div key={selectedService._id} className="mb-6">
                  <h2 className="text-2xl font-bold">Ongoing</h2>
                  <QueueList
                    queue={ongoing}
                    service={selectedService}
                    adminView={true}
                  />
                </div>
              </div>

              <div className="">
                <div key={selectedService._id} className="mb-6">
                  <h2 className="text-2xl font-bold">Waiting</h2>
                  <QueueList
                    availableProviders={availableProviders}
                    queue={waiting}
                    service={selectedService}
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

        {/* Finished Queue Entries */}
        <input
          type="radio"
          name="my_tabs_2"
          className="tab"
          aria-label="Finished"
        />
        <div className="tab-content border-base-300 bg-base-100 p-10">
          {selectedService ? (
            <>
              <div className="">
                <div key={selectedService._id} className="mb-6">
                  <h2 className="text-2xl font-bold">Finished</h2>
                  <QueueList
                    availableProviders={availableProviders}
                    queue={finished}
                    service={selectedService}
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
        <div className="tab-content border-base-300 bg-base-100 p-10">
          {selectedService ? (
            <>
              <div className="">
                <div key={selectedService._id} className="mb-6">
                  <h2 className="text-2xl font-bold">Cancelled</h2>
                  <QueueList
                    availableProviders={availableProviders}
                    queue={cancelled}
                    service={selectedService}
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
    </>
  );
};

const ServiceSelector = ({
  services,
  selectedService,
  setService,
}: {
  services: Service[];
  selectedService?: Service;
  setService: Dispatch<SetStateAction<Service | undefined>>;
}) => {
  return (
    <select
      value={selectedService?._id ?? ""}
      className="select"
      onChange={(e) =>
        setService(services.find((service) => service._id === e.target.value))
      }
    >
      <option disabled={true} value="">
        {services.length > 0 ? "Select a Service" : "No services available"}
      </option>
      {services.map((service) => (
        <option key={service._id} value={service._id}>
          {service.name}
        </option>
      ))}
    </select>
  );
};
