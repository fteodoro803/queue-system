import React, { useState } from "react";
import { MakeQueueEntryModal } from "../queue/MakeQueueEntryModal";
import { useFind, useSubscribe } from "meteor/react-meteor-data";
import { Loading } from "../components/Loading";
import { QueueEntryCollection } from "/imports/api/queueEntry";
import { QueueList } from "../queue/QueueList";

export const QueueManagement = () => {
  const isQueueEntryLoading = useSubscribe("queueEntries");
  const queueEntries = useFind(() =>
    QueueEntryCollection.find({}, { sort: { serviceId: 1, position: 1 } }),
  );

  const [queueEntryModalOpen, setQueueEntryModalOpen] =
    useState<boolean>(false);

  if (isQueueEntryLoading()) {
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

      <div>{/* Test Queue List */}</div>
      <QueueList queue={queueEntries} />

      {/* Modal */}
      {queueEntryModalOpen && (
        <MakeQueueEntryModal setOpen={setQueueEntryModalOpen} />
      )}
    </>
  );
};
