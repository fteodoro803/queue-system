import React, { useState } from "react";
import { MakeQueueEntryModal } from "../queue/MakeQueueEntryModal";
import { useFind, useSubscribe } from "meteor/react-meteor-data";
import { Loading } from "../components/Loading";
import { QueueEntryCollection } from "/imports/api/queueEntry";
import { QueueList } from "../queue/QueueList";
import { ServicesCollection } from "/imports/api/service";
import { resetCounter } from "/imports/api/countersMethods";

export const QueueManagement = () => {
  const isQueueEntryLoading = useSubscribe("queue");
  const queueEntries = useFind(() =>
    QueueEntryCollection.find({}, { sort: { serviceId: 1, position: 1 } }),
  );

  const isServicesLoading = useSubscribe("services");
  const services = useFind(() => ServicesCollection.find());

  const [queueEntryModalOpen, setQueueEntryModalOpen] =
    useState<boolean>(false);

  if (isQueueEntryLoading() || isServicesLoading()) {
    return <Loading />;
  }

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
                  (entry.status === "completed" ||
                    entry.status === "cancelled"),
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
