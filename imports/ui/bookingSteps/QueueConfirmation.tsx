import React from "react";
import { Service } from "/imports/api/service";
import { Patient } from "/imports/api/patient";
import { enqueue } from "/imports/api/queueEntryMethods";
import { useDateTime } from "/imports/contexts/DateTimeContext";

export const QueueConfirmation = ({
  patient,
  service,
  setOpen,
}: {
  patient: Patient | undefined;
  service: Service | undefined;
  setOpen: (value: boolean) => void;
}) => {
  const now = useDateTime();

  // Handlers
  const handleSubmit = async () => {
    if (!patient || !service) return;
    await enqueue({ patient, service }, now);
  };

  return (
    <>
      <p>Confirmation:</p>
      <p>Patient: {patient?.name ?? "None"}</p>
      <p>Service: {service?.name ?? "None"}</p>
      <p>
        Date:{" "}
        {now.toLocaleDateString(undefined, {
          month: "long",
          day: "numeric",
          year: "numeric",
        })}
      </p>
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
