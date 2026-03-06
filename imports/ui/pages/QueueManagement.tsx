import React, { useState } from "react";
import { MakeQueueEntryModal } from "../queue/MakeQueueEntryModal";
import { useFind, useSubscribe } from "meteor/react-meteor-data";
import { Loading } from "../components/Loading";
import { QueueEntryCollection } from "/imports/api/queueEntry";
import { QueueList } from "../queue/QueueList";
import { ServicesCollection } from "/imports/api/service";

export const QueueManagement = () => {
  const isQueueEntryLoading = useSubscribe("queueEntries");
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
        <button
          className="btn btn-primary"
          onClick={() => setQueueEntryModalOpen(true)}
        >
          + Join Queue
        </button>
      </div>

      {services.map((service) => {
        const serviceQueue = queueEntries.filter(
          (entry) => entry.serviceId === service._id,
        );
        return (
          <>
            <h2 className="text-lg font-semibold mt-6 mb-4">{service.name}</h2>
            <QueueList queue={serviceQueue} service={service} />
          </>
        );
      })}

      {/* Modal */}
      {queueEntryModalOpen && (
        <MakeQueueEntryModal setOpen={setQueueEntryModalOpen} />
      )}
    </>
  );
};
