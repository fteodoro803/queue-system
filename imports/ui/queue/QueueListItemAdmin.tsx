import React, { useState } from "react";
import { QueueEntry } from "/imports/api/queueEntry";
import {
  cancelService,
  completeService,
  startService,
} from "/imports/api/queueEntryMethods";
import {
  CalendarDaysIcon,
  ClipboardDocumentListIcon,
  HashtagIcon,
  InformationCircleIcon,
  PlayIcon,
  StopIcon,
  UserIcon,
  XMarkIcon,
  ClockIcon,
  IdentificationIcon,
} from "@heroicons/react/24/outline";
import { QueueIcon } from "../components/QueueIcon";
import { formatDateToLocale } from "/imports/utils/utils";
import { useDateTime } from "/imports/contexts/DateTimeContext";

export const QueueListItemAdmin = ({
  entry,
  timeUntil,
  availableProviders,
}: {
  entry: QueueEntry;
  timeUntil?: number;
  availableProviders?: number;
}) => {
  const now = useDateTime();
  const iconSize: string = "size-6";
  const textSize: string = "text-sm";
  const isHighPriority = entry.service.priority > 1 ? true : false;

  const [openCancelModal, setOpenCancelModal] = useState(false);
  const [openStartModal, setOpenStartModal] = useState(false);
  const [openEndModal, setOpenEndModal] = useState(false);

  const position = entry.position;
  const ready =
    position && availableProviders && position <= availableProviders;

  const statusBadgeMap: Record<string, string> = {
    ready: "badge-success",
    waiting: "badge-info",
    "in-progress": "badge-warning",
    completed: "badge-success",
    cancelled: "badge-error",
  };

  return (
    <>
      <li className="list-row hover:bg-base-200" key={entry._id}>
        {/* Icon */}
        <div className="tabular-nums">
          <QueueIcon entry={entry} />
        </div>

        {/* Details Column */}
        <div className="list-col-grow py-1">
          {/* Patient Name */}
          <div className="card-title">{entry.patient.name}</div>

          {/* Body */}
          <div className="flex items-center gap-4 py-1">
            {/* ID */}
            <div className="flex items-center gap-1">
              <IdentificationIcon className={iconSize} />
              <p className={textSize}>{entry.displayId}</p>
            </div>

            {/* Service */}
            <div className="flex items-center gap-1">
              <ClipboardDocumentListIcon className={iconSize} />
              <p
                className={`${textSize} ${isHighPriority ? "text-error animate-pulse" : ""}`}
              >
                {entry.service.name ?? "N/A"}
              </p>
            </div>

            {/* Estimated Time Until */}
            {entry.status === "waiting" && timeUntil != undefined && (
              <div className="flex items-center gap-1">
                <ClockIcon className={iconSize} />
                <p className={textSize}>
                  {timeUntil > 0 ? `est. ${timeUntil} min` : "est. 0 min"}
                </p>
              </div>
            )}

            {/* Started */}
            {entry.start && !entry.end && (
              <div className="flex items-center gap-1">
                <ClockIcon className={iconSize} />
                <p className={textSize}>
                  {entry.start
                    ? `${formatDateToLocale(entry.start)}-present`
                    : "N/A"}
                </p>
              </div>
            )}

            {/* Completed */}
            {entry.start && entry.end && (
              <div className="flex items-center gap-1">
                <ClockIcon className={iconSize} />
                <p className={textSize}>
                  {entry.start && entry.end
                    ? `${formatDateToLocale(entry.start)}-${formatDateToLocale(entry.end)}`
                    : "N/A"}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Buttons and Status Badge*/}
        <div className="flex items-center gap-4">
          {/* Status */}
          <div
            className={`badge badge-soft ml-auto ${statusBadgeMap[ready ? "ready" : entry.status]}`}
          >
            {ready ? "ready" : entry.status}
          </div>

          {/* Buttons */}
          <div>
            {/* Start Button */}
            {entry.status === "waiting" && (
              <button
                className="btn btn-square btn-ghost"
                onClick={() => {
                  setOpenStartModal(true);
                }}
              >
                <PlayIcon className="w-6" />
              </button>
            )}
            {/* Complete Button */}
            {entry.status === "in-progress" && (
              <button
                className="btn btn-square btn-ghost"
                onClick={() => setOpenEndModal(true)}
              >
                <StopIcon className="w-6" />
              </button>
            )}
            {/* Cancel Button */}
            <button
              className="btn btn-square btn-ghost"
              onClick={() => setOpenCancelModal(true)}
            >
              <XMarkIcon className="w-6" />
            </button>
          </div>
        </div>
      </li>
      {openCancelModal && (
        <CancelModal setOpen={setOpenCancelModal} entry={entry} now={now} />
      )}
      {openStartModal && (
        <StartModal setOpen={setOpenStartModal} entry={entry} now={now} />
      )}
      {openEndModal && (
        <EndModal setOpen={setOpenEndModal} entry={entry} now={now} />
      )}
    </>
  );
};

const getStatusBadgeClass = (status: QueueEntry["status"]): string => {
  const badgeMap: Record<QueueEntry["status"], string> = {
    waiting: "badge-info",
    ready: "badge-success",
    "in-progress": "badge-warning",
    completed: "badge-success",
    cancelled: "badge-error",
  };

  return badgeMap[status];
};

const AppointmentDetails = ({ entry }: { entry: QueueEntry }) => {
  return (
    <div className="rounded-box border border-base-300 bg-base-200/60 p-4">
      <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
        <div className="flex items-center gap-2">
          <UserIcon className="size-4 text-base-content/60" />
          <span className="text-base-content/70">Patient</span>
          <span className="font-medium">{entry.patient.name}</span>
        </div>

        <div className="flex items-center gap-2">
          <IdentificationIcon className="size-4 text-base-content/60" />
          <span className="text-base-content/70">Display ID</span>
          <span className="font-medium">{entry.displayId}</span>
        </div>

        <div className="flex items-center gap-2">
          <ClipboardDocumentListIcon className="size-4 text-base-content/60" />
          <span className="text-base-content/70">Service</span>
          <span className="font-medium">{entry.service.name ?? "N/A"}</span>
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
          <span
            className={`badge badge-soft ${getStatusBadgeClass(entry.status)}`}
          >
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

const ConfirmActionModal = ({
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
