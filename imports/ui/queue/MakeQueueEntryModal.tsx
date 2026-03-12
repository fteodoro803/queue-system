import React, { useEffect, useState } from "react";
import { MODAL_SIZES } from "/imports/utils/modalSizes";
import { Service } from "/imports/api/service";
import { Patient } from "/imports/api/patient";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { Steps } from "../components/Steps";
import { SelectService } from "../bookingSteps/SelectService";
import { SelectPatient } from "../bookingSteps/SelectPatient";
import { QueueConfirmation } from "../bookingSteps/QueueConfirmation";
import { QueueDetails } from "../bookingSteps/QueueDetails";
import { QueueEntry } from "/imports/api/queueEntry";

export const MakeQueueEntryModal = ({
  setOpen,
}: {
  setOpen: (value: boolean) => void;
}) => {
  // States
  const [patient, setPatient] = useState<Patient | undefined>(undefined);
  const [service, setService] = useState<Service | undefined>(undefined);
  const [queueEntry, setQueueEntry] = useState<QueueEntry | undefined>(undefined)
  const [page, setPage] = useState<number>(0);

  const steps: Record<number, string> = {
    1: "Service",
    2: "Patient",
    3: "Confirm",
    4: "Details",
  };

  useEffect(() => {
    changePage("next");
  }, [service, patient, queueEntry]);

  function changePage(change: "next" | "previous") {
    const maxPages: number = 4;
    if (change === "next" && page < maxPages) {
      setPage(page + 1);
    }

    if (change === "previous" && page > 1) {
      setPage(page - 1);
    }
  }

  return (
    <div className="modal modal-open" role={"dialog"}>
      {
        <div className={`modal-box ${MODAL_SIZES.booking} relative`}>
          {/* Close Button */}
          <button
            className="btn btn-circle btn-ghost absolute top-2 right-2 gap-2 p-2 z-50"
            onClick={() => setOpen(false)}
          >
            X
          </button>

          {/* Navigation Buttons */}
          {/* TODO: integreate the changePage functionality with the component */}
          <div className="w-full flex justify-center py-3">
            <div className="join">
              <button
                className="join-item btn btn-ghost btn-circle"
                onClick={() => changePage("previous")}
              >
                <ChevronLeftIcon className="size-6" />
              </button>
              <Steps currentStep={page} steps={steps} />
              <button
                className="join-item btn btn-ghost btn-circle"
                onClick={() => changePage("next")}
              >
                <ChevronRightIcon className="size-6" />
              </button>
            </div>
          </div>

          {/* Modal Content */}
          <div className="flex flex-col py-3 gap-6">
            <h2 className="text-2xl font-bold mb-4">Join Queue</h2>

            {/* Select Service */}
            {page === 1 && <SelectService setService={setService} />}

            {page === 2 && <SelectPatient setPatient={setPatient} />}

            {/* Confirm Details */}
            {page === 3 && (
              <QueueConfirmation
                patient={patient}
                service={service}
                setQueueEntry={setQueueEntry}
                setOpen={setOpen}
              />
            )}

                        {/* Finalised Queue Details */}
            {page === 4 && (
              <QueueDetails 
              entry={queueEntry}
                setOpen={setOpen}
              />
            )}
          </div>
        </div>
      }

      {/* Closes modal when clicking outside */}
      <div className="modal-backdrop" onClick={() => setOpen(false)} />
    </div>
  );
};
