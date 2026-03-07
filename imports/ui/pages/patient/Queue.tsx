import React, { useState } from "react";
import { MakeQueueEntryModal } from "../../queue/MakeQueueEntryModal";

export const Queue = () => {
  const [isModalOpen, setModalOpen] = useState<boolean>(false);

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

        {/* Queue Status for each Service */}

        {/* Join Queue Modal */}
        {isModalOpen && <MakeQueueEntryModal setOpen={setModalOpen} />}
      </div>
    </>
  );
};
