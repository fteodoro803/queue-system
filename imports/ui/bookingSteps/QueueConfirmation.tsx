import React from "react";
import { Service } from "/imports/api/service";
import { Patient } from "/imports/api/patient";
import { enqueue } from "/imports/api/queueEntryMethods";
import { useDateTime } from "/imports/contexts/DateTimeContext";
import {
  CalendarDaysIcon,
  EnvelopeIcon,
  ExclamationTriangleIcon,
  PhoneIcon,
  UserIcon,
  WrenchIcon,
} from "@heroicons/react/24/outline";

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
  const isPriority = (service?.priority ?? 0) > 1;
  const hasEmail = patient?.email != undefined ? true : false;
  const hasNumber = patient?.number != undefined ? true : false;

  // Handlers
  const handleSubmit = async () => {
    if (!patient || !service) return;
    await enqueue({ patient, service }, now);
  };

  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs font-semibold text-base-content/50 uppercase tracking-wider">
        Confirm Queue Entry
      </p>

      {/* Summary rows */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-base-200">
          <UserIcon className="h-4 w-4 text-base-content/40 shrink-0" />
          <span className="text-sm text-base-content/60">Patient</span>
          <span className="text-base-content/30">·</span>
          <span className="text-sm font-semibold">
            {patient?.name ?? "None"}
          </span>
        </div>

        {hasNumber && (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-base-200">
            <PhoneIcon className="h-4 w-4 text-base-content/40 shrink-0" />
            <span className="text-sm text-base-content/60">Number</span>
            <span className="text-base-content/30">·</span>
            <span className="text-sm font-semibold">
              {patient?.number ?? "None"}
            </span>
          </div>
        )}

        {hasEmail && (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-base-200">
            <EnvelopeIcon className="h-4 w-4 text-base-content/40 shrink-0" />
            <span className="text-sm text-base-content/60">Email</span>
            <span className="text-base-content/30">·</span>
            <span className="text-sm font-semibold">
              {patient?.email ?? "None"}
            </span>
          </div>
        )}

        <div className="flex items-center gap-3 p-3 rounded-lg bg-base-200">
          <WrenchIcon className="h-4 w-4 text-base-content/40 shrink-0" />
          <span className="text-sm text-base-content/60">Service</span>
          <span className="text-base-content/30">·</span>
          <span className="text-sm font-semibold">
            {service?.name ?? "None"}
          </span>
        </div>

        <div className="flex items-center gap-3 p-3 rounded-lg bg-base-200">
          <CalendarDaysIcon className="h-4 w-4 text-base-content/40 shrink-0" />
          <span className="text-sm text-base-content/60">Date</span>
          <span className="text-base-content/30">·</span>
          <span className="text-sm font-semibold">
            {now.toLocaleDateString(undefined, {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        </div>
      </div>

      {/* Priority warning */}
      {isPriority && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-error/10 ring-1 ring-error/30 text-error">
          <ExclamationTriangleIcon className="h-4 w-4 shrink-0" />
          <span className="text-sm font-medium">
            This is a high-priority service
          </span>
        </div>
      )}

      <button
        className="btn btn-primary w-full"
        onClick={() => {
          handleSubmit();
          setOpen(false);
        }}
      >
        Confirm
      </button>
    </div>
  );

  // OLD
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

      {isPriority && (
        <div role="alert" className="alert alert-error">
          <span>This is a high-priority service!</span>
        </div>
      )}

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
