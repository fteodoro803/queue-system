import React, { useState } from "react";
import { MakeQueueEntryModal } from "../queue/MakeQueueEntryModal";
import { useFind, useSubscribe } from "meteor/react-meteor-data";
import { Loading } from "../components/Loading";
import { QueueEntryCollection } from "/imports/api/queueEntry";
import { QueueList } from "../queue/QueueList";
import { ServicesCollection } from "/imports/api/service";
import { resetCounter } from "/imports/api/countersMethods";
import { DashboardCard } from "../components/DashboardCard";
import {
  ChartBarIcon,
  IdentificationIcon,
  NumberedListIcon,
} from "@heroicons/react/24/outline";
import { ProviderCollection } from "/imports/api/provider";


export const QueueManagement = () => {
  const isQueueEntryLoading = useSubscribe("queue");
  const queueEntries = useFind(() =>
    QueueEntryCollection.find({}, { sort: { serviceId: 1, position: 1 } }),
  );

  const isServicesLoading = useSubscribe("services");
  const services = useFind(() => ServicesCollection.find());

  const isProvidersLoading = useSubscribe("providers");
  const providers = useFind(() => ProviderCollection.find({}));

  const [queueEntryModalOpen, setQueueEntryModalOpen] =
    useState<boolean>(false);

  if (isQueueEntryLoading() || isServicesLoading() || isProvidersLoading()) {
    return <Loading />;
  }

  const selectedService = services[0]; // TODO: make this dynamic based on user selection
  const serviceEfficiency =
    selectedService?.avgDuration != null
      ? Math.ceil(
          (selectedService.duration / selectedService.avgDuration) * 100,
        )
      : undefined;

  const getEfficiencyLabel = (score: number) => {
    if (score >= 115) return "well ahead of schedule";
    if (score >= 105) return "beating expectations";
    if (score >= 95) return "meeting expectations";
    if (score >= 80) return "review workload";
    return "needs attention";
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
          body={
            providers.filter((p) => p.services.some((s) => s.enabled)).length
          }
          footer={`Unavailable: ${providers.filter((p) => !p.services.some((s) => s.enabled)).length}`}
          icon={IdentificationIcon}
        />
      </div>

      {/* Performance Card */}
      <div className="my-4">
        <DashboardCard
          header="Performance Score"
          body={serviceEfficiency != null ? `${serviceEfficiency}%` : "N/A"}
          footer={
            serviceEfficiency != null
              ? getEfficiencyLabel(serviceEfficiency)
              : "No data yet"
          }
          icon={ChartBarIcon}
        />
      </div></div>

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
          <div className="">
            {services.map((service) => {
              const serviceQueue = queueEntries.filter(
                (entry) =>
                  entry.serviceId === service._id &&
                  (entry.status === "waiting" ||
                    entry.status === "in-progress"),
              );
              return (
                <div key={service._id} className="mb-6">
                  <h2 className="text-2xl font-bold">{service.name}</h2>
                  <QueueList
                    queue={serviceQueue}
                    service={service}
                    adminView={true}
                  />
                </div>
              );
            })}
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
              const serviceQueue = queueEntries.filter(
                (entry) =>
                  entry.serviceId === service._id &&
                  entry.status === "completed",
              );
              return (
                <div key={service._id} className="mb-6">
                  <h2 className="text-2xl font-bold">{service.name}</h2>
                  <QueueList
                    queue={serviceQueue}
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
              const serviceQueue = queueEntries.filter(
                (entry) =>
                  entry.serviceId === service._id &&
                  entry.status === "cancelled",
              );
              return (
                <div key={service._id} className="mb-6">
                  <h2 className="text-2xl font-bold">{service.name}</h2>
                  <QueueList
                    queue={serviceQueue}
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
