import React from "react";
import { Service } from "/imports/api/service";
import { Provider } from "/imports/api/provider";
import { insertAppointment } from "/imports/api/appointmentMethods";
import { Patient } from "/imports/api/patient";

export const Confirmation = ({
  service,
  provider,
  date,
  setOpen,
}: {
  service: Service | undefined;
  provider: Provider | undefined;
  date: Date | undefined;
  setOpen: (value: boolean) => void;
}) => {
  const PLACEHOLDER_PATIENT: Patient = {
    _id: "PLACEHOLDER_ID",
    name: "PLACEHOLDER_NAME",
    createdAt: new Date(),
  };

  const handleSubmit = async () => {
    if (service && date && provider && PLACEHOLDER_PATIENT) {
      await insertAppointment({
        patient: PLACEHOLDER_PATIENT,
        date,
        provider,
        service,
        status: "scheduled",
      });
    }
  };

  return (
    <>
      <p>Confirmation:</p>
      <p>Service: {service?.name ?? "None"}</p>
      <p>Provider: {provider?.name ?? "Any"}</p>
      <p>Date and Time: {date?.toLocaleString() ?? "None"}</p>
      <button
        className="btn"
        onClick={() => {
          handleSubmit();
          setOpen(false);
        }}
      >
        Confirm
      </button>
    </>
  );
};
