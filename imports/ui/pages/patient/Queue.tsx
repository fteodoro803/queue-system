import React, { useState } from "react";
import { MakeQueueEntryModal } from "../../queue/MakeQueueEntryModal";
import { QueueList } from "../../queue/QueueList";
import { Loading } from "../../components/Loading";
import { useFind, useSubscribe } from "meteor/react-meteor-data";
import { ServicesCollection } from "/imports/api/service";
import { QueueEntryCollection } from "/imports/api/queueEntry";

export const Queue = () => {
  const [isModalOpen, setModalOpen] = useState<boolean>(false);

  const isQueueEntryLoading = useSubscribe("queue");
  const queueEntries = useFind(() =>
    QueueEntryCollection.find({}, { sort: { serviceId: 1, position: 1 } }),
  );

  const isServicesLoading = useSubscribe("services");
  const services = useFind(() => ServicesCollection.find());

  if (isQueueEntryLoading() || isServicesLoading()) {
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
              (entry.status === "waiting" || entry.status === "in-progress"),
          );
          return (
            <div key={service._id} className="mb-6">
              <h2 className="text-2xl font-bold">{service.name}</h2>
              <QueueList queue={serviceQueue} service={service} />
            </div>
          );
        })}

        {/* Join Queue Modal */}
        {isModalOpen && <MakeQueueEntryModal setOpen={setModalOpen} />}
      </div>
    </>
  );
};
