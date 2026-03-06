import React from "react";
import { QueueEntry } from "/imports/api/queueEntry";
import { useFind, useSubscribe } from "meteor/react-meteor-data";
import { ServicesCollection } from "/imports/api/service";
import { QueueListItem } from "./QueueListItem";

export const QueueList = ({ queue }: { queue: QueueEntry[] }) => {
  const isServicesLoading = useSubscribe("services");
  const services = useFind(() => ServicesCollection.find());

  if (isServicesLoading()) {
    return <div>Loading...</div>;
  }

  return (
    <ul className="list bg-base-100 rounded-box shadow-md">
      {services.map((service) => (
        <>
          {/* Service header */}
          <li
            key={service._id}
            className="p-4 pb-2 text-xs opacity-60 tracking-wide"
          >
            {service.name}
          </li>

          {/* Queue for respective Service */}
          {queue
            .filter((entry) => entry.serviceId === service._id)
            .map((entry) => (
              <QueueListItem key={entry._id} entry={entry} />
            ))}
        </>
      ))}
    </ul>
  );
};
