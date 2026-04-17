import React, { useState } from "react";
import { QueueEntry } from "/imports/api/queueEntry";
import {
  ClipboardDocumentListIcon,
  PlayIcon,
  StopIcon,
  XMarkIcon,
  ClockIcon,
  IdentificationIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import { QueueIcon } from "/imports/ui/components/QueueIcon";
import { formatDateToLocale } from "/imports/utils/utils";
import { useDateTime } from "/imports/contexts/DateTimeContext";
import { QueueTimeResult, statusBadgeMap } from "/imports/utils/queueUtils";
import {
  CancelModal,
  CheckInModal,
  EndModal,
  StartModal,
} from "/imports/ui/queue/ConfirmActionModal";
import { Patient } from "/imports/api/patient";
import { Service } from "/imports/api/service";

interface QueueListItemProps {
  entry: QueueEntry;
  patient: Patient;
  service: Service;
  timeUntil?: QueueTimeResult;
  availableProviders?: number;
  admin?: boolean;
}

const iconSize: string = "size-6";
const textSize: string = "text-sm";

export const QueueListItem = ({
  entry,
  patient,
  service,
  timeUntil,
  availableProviders,
  admin,
}: QueueListItemProps) => {
  const now = useDateTime();

  const [openCancelModal, setOpenCancelModal] = useState(false);
  const [openStartModal, setOpenStartModal] = useState(false);
  const [openEndModal, setOpenEndModal] = useState(false);
  const [openCheckInModal, setOpenCheckInModal] = useState(false);

  const position = entry.position;
  const isHighPriority = (service.priority ?? 0) > 1;

  // Ready if position is 1 or less than there are available providers
  const isProviderAvailable: boolean = Boolean(
    position && availableProviders && position <= availableProviders,
  );

  return (
    <>
      <li className="list-row hover:bg-base-200" key={entry._id}>
        {/* Icon */}
        <div className="tabular-nums">
          <QueueIcon entry={entry} />
        </div>

        {/* Details Column */}
        <div className="list-col-grow py-1">
          {/* Header */}
          <div className="card-title">
            {admin ? patient.name : entry.displayId}
          </div>

          {/* Body */}
          <div className="flex items-center gap-4 py-1">
            {/* ID */}
            {admin && (
              <div className="flex items-center gap-1">
                <IdentificationIcon className={iconSize} />
                <p className={textSize}>{entry.displayId}</p>
              </div>
            )}

            {/* Service */}
            <div className="flex items-center gap-1">
              <ClipboardDocumentListIcon className={iconSize} />
              <p
                className={`${textSize} ${isHighPriority ? "text-error animate-pulse" : ""}`}
              >
                {service.name}
              </p>
            </div>

            {/* Time Status */}
            <TimeStatus entry={entry} timeUntil={timeUntil} />
          </div>
        </div>

        {/* Buttons and Status Badge*/}
        <div className="flex items-center gap-4">
          {/* Status */}
          <div
            className={`badge badge-soft ml-auto ${statusBadgeMap[entry.status]}`}
          >
            {entry.status}
          </div>
          {/* Buttons */}
          {admin && (
            <ActionButtons
              status={entry.status}
              setOpenCheckInModal={setOpenCheckInModal}
              setOpenStartModal={setOpenStartModal}
              setOpenEndModal={setOpenEndModal}
              setOpenCancelModal={setOpenCancelModal}
              isProviderAvailable={isProviderAvailable}
            />
          )}
        </div>
      </li>

      {/* Modals */}
      {openCancelModal && (
        <CancelModal setOpen={setOpenCancelModal} entry={entry} now={now} />
      )}
      {openStartModal && (
        <StartModal setOpen={setOpenStartModal} entry={entry} now={now} />
      )}
      {openEndModal && (
        <EndModal setOpen={setOpenEndModal} entry={entry} now={now} />
      )}
      {openCheckInModal && (
        <CheckInModal setOpen={setOpenCheckInModal} entry={entry} now={now} />
      )}
    </>
  );
};

const TimeStatus = ({
  entry,
  timeUntil,
}: {
  entry: QueueEntry;
  timeUntil?: QueueTimeResult;
}) => {
  return (
    <>
      {/* Estimated Time Until */}
      {(entry.status === "waiting" || entry.status === "ready") &&
        timeUntil != undefined && (
          <div className="flex items-center gap-1">
            <ClockIcon className={iconSize} />
            <p className={textSize}>
              {timeUntil.ok
                ? `est. ${timeUntil.time} min`
                : `ERROR (${timeUntil.reason})`}
            </p>
          </div>
        )}

      {/* Started */}
      {entry.start && !entry.end && (
        <div className="flex items-center gap-1">
          <ClockIcon className={iconSize} />
          <p className={textSize}>
            {entry.start ? `${formatDateToLocale(entry.start)}-present` : "N/A"}
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
    </>
  );
};

const ActionButtons = ({
  status,
  setOpenCheckInModal,
  setOpenStartModal,
  setOpenEndModal,
  setOpenCancelModal,
  isProviderAvailable,
}: {
  status: string;
  setOpenCheckInModal: (bool: boolean) => void;
  setOpenStartModal: (bool: boolean) => void;
  setOpenEndModal: (bool: boolean) => void;
  setOpenCancelModal: (bool: boolean) => void;
  isProviderAvailable: boolean;
}) => {
  return (
    <div>
      {/* Check-in Button */}
      {status === "waiting" && (
        <button
          className="btn btn-square btn-ghost"
          onClick={() => {
            setOpenCheckInModal(true);
          }}
        >
          <CheckIcon className="w-6" />
        </button>
      )}
      {/* Start Button */}
      {status === "ready" && (
        <button
          className="btn btn-square btn-ghost"
          disabled={!isProviderAvailable}
          onClick={() => {
            setOpenStartModal(true);
          }}
        >
          <PlayIcon className="w-6" />
        </button>
      )}
      {/* Complete Button */}
      {status === "in-progress" && (
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
  );
};
