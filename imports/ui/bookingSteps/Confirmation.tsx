import React from "react";
import { Service } from "/imports/api/service";
import { Provider } from "/imports/api/provider";
import { insertAppointment } from "/imports/api/appointmentMethods";
import { Patient } from "/imports/api/patient";

export const Confirmation = ({
  patient,
  service,
  provider,
  date,
  setOpen,
}: {
  patient: Patient | undefined;
  service: Service | undefined;
  provider: Provider | undefined;
  date: Date | undefined;
  setOpen: (value: boolean) => void;
}) => {
  const handleSubmit = async () => {
    if (service && date && provider && patient) {
      await insertAppointment({
        patient,
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
      <p>Patient: {patient?.name ?? "None"}</p>
      <p>Service: {service?.name ?? "None"}</p>
      <p>Provider: {provider?.name ?? "Any"}</p>
      <p>Date and Time: {date?.toLocaleString() ?? "None"}</p>
      <button
        className="btn btn-primary"
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
