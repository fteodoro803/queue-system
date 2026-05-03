import React, { useState } from "react";
import { QueueEntry, QueueStatus } from "/imports/api/queueEntry";
import {
  ClipboardDocumentListIcon,
  ClockIcon,
  IdentificationIcon,
} from "@heroicons/react/24/outline";
import { QueueIcon } from "/imports/ui/components/QueueIcon";
import { convertMinutesToTime, formatDateToLocale } from "/imports/utils/utils";
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
import { ChevronDownIcon } from "@heroicons/react/24/solid";

interface QueueListItemProps {
  entry: QueueEntry;
  patient: Patient;
  service: Service;
  timeUntil?: QueueTimeResult;
  availableProviders?: number;
  admin?: boolean;
}

const iconSize: string = "size-5";
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
          <div className="flex items-center justify-between gap-2">
            <div className="card-title truncate">
              {admin ? patient.name : entry.displayId}
            </div>
            <div
              className={`badge badge-soft md:hidden ${statusBadgeMap[entry.status]}`}
            >
              {entry.status}
            </div>
          </div>

          {/* Body */}
          <div className="flex flex-wrap items-center sm:gap-1 md:gap-4 py-1">
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
            className={`badge badge-soft ml-auto hidden md:inline-flex ${statusBadgeMap[entry.status]}`}
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
        timeUntil && (
          <div className="flex items-center gap-1">
            <ClockIcon className={iconSize} />
            <p className={textSize}>
              {timeUntil && timeUntil.ok
                ? `est. ${convertMinutesToTime(timeUntil.time)}`
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
  status: QueueStatus;
  setOpenCheckInModal: (bool: boolean) => void;
  setOpenStartModal: (bool: boolean) => void;
  setOpenEndModal: (bool: boolean) => void;
  setOpenCancelModal: (bool: boolean) => void;
  isProviderAvailable: boolean;
}) => {
  return (
    <div>
      {/* NEW */}
      <div className="join flex">
        {/* Main Button */}
        {status === "waiting" ? (
          <button
            className="join-item btn"
            onClick={() => setOpenCheckInModal(true)}
          >
            Check-in
          </button>
        ) : status === "ready" ? (
          <button
            className="join-item btn"
            onClick={() => setOpenStartModal(true)}
          >
            Start
          </button>
        ) : (
          <button
            className="join-item btn"
            onClick={() => setOpenEndModal(true)}
          >
            Finish
          </button>
        )}

        {/* Dropdown Button */}
        <div className="dropdown dropdown-end">
          <button tabIndex={0} role="button" className="join-item btn">
            <ChevronDownIcon className="size-3" />
          </button>
          <ul
            tabIndex={0}
            className="dropdown-content menu bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm"
          >
            {/* Check in and Start */}
            {status === "waiting" && isProviderAvailable && (
              <li>
                <a onClick={() => setOpenStartModal(true)}>
                  Check-in and Start
                </a>
              </li>
            )}

            {/* Cancel */}
            <li>
              <a onClick={() => setOpenCancelModal(true)}>Cancel</a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
