import React, { useEffect, useState } from "react";
import { Steps } from "../components/Steps";
import { SelectService } from "./makeAppointment/SelectService";
import { Service } from "/imports/api/service";
import { Provider } from "/imports/api/provider";
import { SelectProvider } from "./makeAppointment/SelectProvider";
import { SelectDateTime } from "./makeAppointment/SelectDateTime";
import { Confirmation } from "./makeAppointment/Confirmation";
import { MODAL_SIZES } from "/imports/utils/modalSizes";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { SelectPatient } from "./makeAppointment/SelectPatient";
import { Patient } from "/imports/api/patient";

export const MakeAppointmentModal = ({
  setOpen,
}: {
  setOpen: (value: boolean) => void;
}) => {
  const [service, setService] = useState<Service | undefined>(undefined);
  const [provider, setProvider] = useState<Provider | undefined>(undefined);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [page, setPage] = useState<number>(0);
  const [patient, setPatient] = useState<Patient | undefined>(undefined);

  useEffect(() => {
    changePage("next");
  }, [service, provider, date, patient]);

  function changePage(change: "next" | "previous") {
    const maxPages: number = 5;
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
          <div className="w-full flex justify-center py-3">
            <div className="join">
              <button
                className="join-item btn btn-ghost btn-circle"
                onClick={() => changePage("previous")}
              >
                <ChevronLeftIcon className="size-6" />
              </button>
              <Steps step={page} />
              <button
                className="join-item btn btn-ghost btn-circle"
                onClick={() => changePage("next")}
              >
                <ChevronRightIcon className="size-6" />
              </button>
            </div>
          </div>

          {/* Select Service */}
          {page === 1 && <SelectService setService={setService} />}
          {/* Select Provider */}
          {page === 2 && (
            <SelectProvider setProvider={setProvider} service={service} />
          )}
          {/* Select Date and Time */}
          {page === 3 && (
            <SelectDateTime
              setDate={setDate}
              service={service}
              provider={provider}
            />
          )}
          {/* Select Patient */}
          {page === 4 && <SelectPatient setPatient={setPatient} />}
          {/* Confirmation */}
          {page === 5 && (
            <Confirmation
              service={service}
              provider={provider}
              date={date}
              patient={patient}
              setOpen={setOpen}
            />
          )}

          {/* <p>Service: {service?.name}</p>
        <p>Provider: {provider?.name}</p>
        <p>Date: {date?.getDate()}</p> */}
        </div>
      }

      {/* Closes modal when clicking outside */}
      <div className="modal-backdrop" onClick={() => setOpen(false)} />
    </div>
  );
};
