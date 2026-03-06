import React, { useState } from "react";
import { MakeQueueEntryModal } from "../queue/MakeQueueEntryModal";
import { useFind, useSubscribe } from "meteor/react-meteor-data";
import { Loading } from "../components/Loading";
import { QueueEntryCollection } from "/imports/api/queueEntry";
import { PlayIcon } from "@heroicons/react/24/outline";

export const QueueManagement = () => {
  const isQueueEntryLoading = useSubscribe("queueEntries");
  const queueEntries = useFind(() => QueueEntryCollection.find({})); // Replace with actual query to fetch queue entries

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

      <div>{/* Queue List */}</div>
      <ul className="list bg-base-100 rounded-box shadow-md">
        <li className="p-4 pb-2 text-xs opacity-60 tracking-wide">
          All Queue Entries
        </li>

        {queueEntries.map((entry) => (
          <li className="list-row" key={entry._id}>
            <div className="text-4xl font-thin opacity-30 tabular-nums">
              {entry.position !== null ? entry.position : "--"}
            </div>
            <div className="list-col-grow">
              <div>{entry.patient.name}</div>
              <div className="text-xs uppercase font-semibold opacity-60">
                {entry.service.name}
              </div>
            </div>
            <button className="btn btn-square btn-ghost">
              <PlayIcon className="w-6" />
            </button>
          </li>
        ))}
      </ul>

      {/* Modal */}
      {queueEntryModalOpen && (
        <MakeQueueEntryModal setOpen={setQueueEntryModalOpen} />
      )}
    </>
  );
};
