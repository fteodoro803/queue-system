import React, { useMemo, useState } from "react";
import { MakeQueueEntryModal } from "/imports/ui/queue/MakeQueueEntryModal";
import { useFind, useSubscribe, useTracker } from "meteor/react-meteor-data";
import { Loading } from "/imports/ui/components/Loading";
import { QueueEntryCollection } from "/imports/api/queueEntry";
import { QueueList } from "/imports/ui/queue/QueueList";
import { ServicesCollection } from "/imports/api/service";
import { DashboardCard } from "/imports/ui/components/DashboardCard";
import {
  ClockIcon,
  IdentificationIcon,
  NumberedListIcon,
} from "@heroicons/react/24/outline";
import { Session } from "meteor/session";
import {
  convertMillisecondsToTime,
  convertMinutesToTime,
  getEndOfWorkDay,
} from "/imports/utils/utils";
import { useDateTime } from "/imports/contexts/DateTimeContext";
import { SettingsCollection } from "/imports/api/settings";

export const QueueManagement = () => {
  const isQueueEntryLoading = useSubscribe("queue");
  const queueEntries = useFind(() =>
    QueueEntryCollection.find({}, { sort: { serviceId: 1, position: 1 } }),
  );

  const isServicesLoading = useSubscribe("services");
  const services = useFind(() => ServicesCollection.find());
  const demoService = services[0];

  const isProvidersLoading = useSubscribe("providers");
  // const providers = useFind(() => ProviderCollection.find({}));

  const [queueEntryModalOpen, setQueueEntryModalOpen] =
    useState<boolean>(false);

  // TODO: temporary? probably should be calculated on the server and stored somewhere
  const maxQueueLength = useTracker(
    () => Session.get("maxQueueLength") || null,
  );

  const TOTAL_PROVIDERS = 2;

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

  const unavailableProviders = ongoing?.length;

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
  const now = useDateTime();
  const endOfDay = getEndOfWorkDay(now, settings.end_of_day);
  const timeRemainingMs = endOfDay.getTime() - now.getTime(); // in milliseconds
  const formattedTimeRemaining = convertMillisecondsToTime(timeRemainingMs);
  const maxQueueLengthMs = maxQueueLength * 60 * 1000; // convert mins to ms

  const getQueueTimeColor = () => {
    if (maxQueueLengthMs >= timeRemainingMs) return "text-error";
    if (maxQueueLengthMs >= timeRemainingMs * 0.5) return "text-warning";
    return "";
  };

  return (
    <>
      <div className="flex justify-between">
        <h1 className="text-3xl font-bold">Queue Management</h1>
        <div className="flex gap-1">
          {/* <button
            className="btn btn-primary"
            onClick={async () => {
              await resetCounter();
            }}
          >
            - Clear Counter
          </button> */}
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
            body={TOTAL_PROVIDERS - unavailableProviders}
            footer={`Unavailable: ${unavailableProviders}`}
            icon={IdentificationIcon}
          />
        </div>

        <div className="my-4">
          <DashboardCard
            header="Total Queue Time"
            body={convertMinutesToTime(maxQueueLength)}
            // footer={`${formattedTimeRemaining} remaining`}
            footer={
              <p className={getQueueTimeColor()}>
                {formattedTimeRemaining} left in day
              </p>
            }
            icon={ClockIcon}
          />
        </div>
      </div>

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

        {/* TODO: TEMPORARY CHANGE THIS LATER */}
        <div className="tab-content border-base-300 bg-base-100 p-10">
          <div className="">
            <div key={demoService._id} className="mb-6">
              <h2 className="text-2xl font-bold">Ongoing</h2>
              <QueueList
                queue={ongoing}
                service={demoService}
                adminView={true}
              />
            </div>
          </div>

          {/* TODO: TEMPORARY CHANGE THIS LATER */}
          <div className="">
            <div key={demoService._id} className="mb-6">
              <h2 className="text-2xl font-bold">Waiting</h2>
              <QueueList
                availableProviders={TOTAL_PROVIDERS - unavailableProviders}
                queue={waiting}
                service={demoService}
                adminView={true}
              />
            </div>
          </div>
        </div>

        {/* Finished Queue Entries */}
        <input
          type="radio"
          name="my_tabs_2"
          className="tab"
          aria-label="Finished"
        />
        <div className="tab-content border-base-300 bg-base-100 p-10">
          <div className="">
            {services.map((service) => {
              return (
                <div key={service._id} className="mb-6">
                  <h2 className="text-2xl font-bold">{service.name}</h2>
                  <QueueList
                    queue={finished.filter(
                      (entry) => entry.serviceId === service._id,
                    )}
                    service={service}
                    adminView={true}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Cancelled Queue Entries */}
        <input
          type="radio"
          name="my_tabs_2"
          className="tab"
          aria-label="Cancelled"
        />
        <div className="tab-content border-base-300 bg-base-100 p-10">
          <div className="">
            {services.map((service) => {
              return (
                <div key={service._id} className="mb-6">
                  <h2 className="text-2xl font-bold">{service.name}</h2>
                  <QueueList
                    queue={cancelled.filter(
                      (entry) => entry.serviceId === service._id,
                    )}
                    service={service}
                    adminView={true}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modal */}
      {queueEntryModalOpen && (
        <MakeQueueEntryModal setOpen={setQueueEntryModalOpen} />
      )}
    </>
  );
};
