import React, { useEffect, useState } from "react";
import { Steps } from "../components/Steps";
import { SelectService } from "./makeAppointment/SelectService";
import { Service } from "/imports/api/service";
import { Provider } from "/imports/api/provider";
import { SelectProvider } from "./makeAppointment/SelectProvider";
import { SelectDateTime } from "./makeAppointment/SelectDateTime";
import { Confirmation } from "./makeAppointment/Confirmation";
import { MODAL_SIZES } from "/imports/utils/modalSizes";

export const MakeAppointmentModal = ({
  setOpen,
}: {
  setOpen: (value: boolean) => void;
}) => {
  const [service, setService] = useState<Service | undefined>(undefined);
  const [provider, setProvider] = useState<Provider | undefined>(undefined);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [page, setPage] = useState<number>(0);

  useEffect(() => {
    changePage("next");
  }, [service, provider, date]);

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
        <div className={`modal-box ${MODAL_SIZES.booking}`}>
          {/* Close Button */}
          <button
            className="btn btn-circle btn-btn-ghost absolute top-2 right-2 gap-2 p-2"
            onClick={() => setOpen(false)}
          >
            X
          </button>

          {/* Navigation Buttons */}
          <div className="flex justify-center">
            <div className="join">
              <button
                className="join-item btn"
                onClick={() => changePage("previous")}
              >
                «
              </button>
              <button className="join-item btn">Step {page}</button>
              <button
                className="join-item btn"
                onClick={() => changePage("next")}
              >
                »
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
            <SelectDateTime date={date} setDate={setDate} service={service} />
          )}
          {/* Confirmation */}
          {page === 4 && service && date && (
            <Confirmation
              service={service}
              provider={provider}
              dateTime={date}
            />
          )}

          {/* <p>Service: {service?.name}</p>
        <p>Provider: {provider?.name}</p>
        <p>Date: {date?.getDate()}</p> */}
        </div>
      }
    </div>
  );
};
