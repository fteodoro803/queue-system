import React, { useEffect, useState } from "react";
import { QueueEntry } from "/imports/api/queueEntry";
import {
  CalendarDaysIcon,
  ClipboardDocumentListIcon,
  ClockIcon,
  HashtagIcon,
  IdentificationIcon,
  InformationCircleIcon,
  UserIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { formatDateToLocale } from "/imports/utils/utils";
import { statusBadgeMap } from "/imports/utils/queueUtils";
import {
  cancelService,
  completeService,
  startService,
  checkIn,
} from "/imports/api/queueEntryMethods";
import { Patient } from "/imports/api/patient";
import { Service } from "/imports/api/service";
import { getPatient } from "/imports/api/patientsMethods";
import { getService } from "/imports/api/serviceMethods";

/**
 * Action modals for queue entry management.
 *
 * Provides a reusable `ConfirmActionModal` base component and four
 * pre-configured variants: `CancelModal`, `StartModal`, `EndModal`, and `CheckInModal`.
 */

/**
 * A generic confirmation modal for queue entry actions.
 * Displays entry details and a configurable confirm button.
 *
 * @param setOpen - Controls modal visibility
 * @param entry - The queue entry being acted on
 * @param title - Modal heading
 * @param message - Short description of the action
 * @param confirmLabel - Label for the confirm button
 * @param confirmClass - DaisyUI btn class for the confirm button (e.g. "btn-error")
 * @param onConfirm - Callback fired when the confirm button is clicked
 */
export const ConfirmActionModal = ({
  setOpen,
  entry,
  title,
  message,
  confirmLabel,
  confirmClass,
  onConfirm,
}: {
  setOpen: (value: boolean) => void;
  entry: QueueEntry;
  title: string;
  message: string;
  confirmLabel: string;
  confirmClass: string;
  onConfirm: () => void;
}) => {
  return (
    <div className="modal modal-open" role="dialog" aria-modal="true">
      <div className="modal-box relative w-11/12 max-w-2xl">
        <button
          className="btn btn-circle btn-ghost absolute right-3 top-3"
          onClick={() => setOpen(false)}
          aria-label="Close modal"
        >
          <XMarkIcon className="size-5" />
        </button>

        <h3 className="pr-10 text-lg font-semibold">{title}</h3>
        <p className="mt-1 text-sm text-base-content/70">{message}</p>

        <div className="mt-4">
          <AppointmentDetails entry={entry} />
        </div>

        <div className="modal-action mt-5">
          <button className="btn btn-ghost" onClick={() => setOpen(false)}>
            Close
          </button>
          <button
            className={`btn ${confirmClass}`}
            onClick={() => {
              onConfirm();
              setOpen(false);
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>

      <div className="modal-backdrop" onClick={() => setOpen(false)} />
    </div>
  );
};

/**
 * Displays detailed information about a queue entry.
 *
 * @param entry - The queue entry to display details for
 */
const AppointmentDetails = ({ entry }: { entry: QueueEntry }) => {
  const [patient, setPatient] = useState<Patient | undefined>(undefined);
  const [service, setService] = useState<Service | undefined>(undefined);

  useEffect(() => {
    // Fetch patient and service details for the entry
    const fetchDetails = async () => {
      const patientData = await getPatient(entry.patientId);
      setPatient(patientData);
      const serviceData = await getService(entry.serviceId);
      setService(serviceData ?? undefined);
    };
    fetchDetails();
  }, [entry.patientId, entry.serviceId]);

  return (
    <div className="rounded-box border border-base-300 bg-base-200/60 p-4">
      <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
        <div className="flex items-center gap-2">
          <UserIcon className="size-4 text-base-content/60" />
          <span className="text-base-content/70">Patient</span>
          <span className="font-medium">{patient?.name ?? "N/A"}</span>
        </div>

        <div className="flex items-center gap-2">
          <IdentificationIcon className="size-4 text-base-content/60" />
          <span className="text-base-content/70">Display ID</span>
          <span className="font-medium">{entry.displayId}</span>
        </div>

        <div className="flex items-center gap-2">
          <ClipboardDocumentListIcon className="size-4 text-base-content/60" />
          <span className="text-base-content/70">Service</span>
          <span className="font-medium">{service?.name ?? "N/A"}</span>
        </div>

        <div className="flex items-center gap-2">
          <HashtagIcon className="size-4 text-base-content/60" />
          <span className="text-base-content/70">Queue position</span>
          <span className="font-medium">
            {entry.position != null ? `#${entry.position}` : "N/A"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <InformationCircleIcon className="size-4 text-base-content/60" />
          <span className="text-base-content/70">Status</span>
          <span className={`badge badge-soft ${statusBadgeMap[entry.status]}`}>
            {entry.status}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <CalendarDaysIcon className="size-4 text-base-content/60" />
          <span className="text-base-content/70">Queued at</span>
          <span className="font-medium">
            {formatDateToLocale(entry.createdAt)}
          </span>
        </div>

        {entry.start && (
          <div className="flex items-center gap-2">
            <ClockIcon className="size-4 text-base-content/60" />
            <span className="text-base-content/70">Started</span>
            <span className="font-medium">
              {entry.start ? formatDateToLocale(entry.start) : "Not started"}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Modal for confirming the cancellation of a queue entry.
 *
 * @param setOpen - Controls modal visibility
 * @param entry - The queue entry being acted on
 * @param now - The current date and time
 */
export const CancelModal = ({
  setOpen,
  entry,
  now,
}: {
  setOpen: (value: boolean) => void;
  entry: QueueEntry;
  now: Date;
}) => {
  return (
    <ConfirmActionModal
      setOpen={setOpen}
      entry={entry}
      title="Cancel Appointment"
      message="This will remove the patient from the active queue."
      confirmLabel="Confirm Cancellation"
      confirmClass="btn-error"
      onConfirm={() => cancelService(entry._id, now)}
    />
  );
};

/**
 * Modal for confirming the start of a queue entry.
 *
 * @param setOpen - Controls modal visibility
 * @param entry - The queue entry being acted on
 * @param now - The current date and time
 */
export const StartModal = ({
  setOpen,
  entry,
  now,
}: {
  setOpen: (value: boolean) => void;
  entry: QueueEntry;
  now: Date;
}) => {
  return (
    <ConfirmActionModal
      setOpen={setOpen}
      entry={entry}
      title="Start Appointment"
      message="This marks the patient as currently being served."
      confirmLabel="Start Service"
      confirmClass="btn-primary"
      onConfirm={() => startService(entry._id, now)}
    />
  );
};

/**
 * Modal for confirming the completion of a queue entry.
 *
 * @param setOpen - Controls modal visibility
 * @param entry - The queue entry being acted on
 * @param now - The current date and time
 */
export const EndModal = ({
  setOpen,
  entry,
  now,
}: {
  setOpen: (value: boolean) => void;
  entry: QueueEntry;
  now: Date;
}) => {
  return (
    <ConfirmActionModal
      setOpen={setOpen}
      entry={entry}
      title="Complete Appointment"
      message="This will mark the appointment as completed and end service time."
      confirmLabel="Complete Service"
      confirmClass="btn-success"
      onConfirm={() => completeService(entry._id, now)}
    />
  );
};

export const CheckInModal = ({
  setOpen,
  entry,
  now,
}: {
  setOpen: (value: boolean) => void;
  entry: QueueEntry;
  now: Date;
}) => {
  return (
    <ConfirmActionModal
      setOpen={setOpen}
      entry={entry}
      title="Check-In Appointment"
      message="This will mark the patient as checked in and ready for service."
      confirmLabel="Check-In"
      confirmClass="btn-success"
      onConfirm={() => checkIn(entry._id, now)}
    />
  );
};
