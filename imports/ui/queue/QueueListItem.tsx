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
      <li className="px-4 py-3 hover:bg-base-200" key={entry._id}>
        {/* Mobile layout  */}
        <div className="flex min-w-0 flex-col gap-2 md:hidden">
          {/* Top */}
          <div className="flex min-w-0 items-center gap-3">
            {/* Top Left */}
            {/* Queue Icon */}
            <div className="shrink-0 tabular-nums">
              <QueueIcon entry={entry} className="h-14 w-14" />
            </div>

            {/* Top Right*/}
            <div className="flex min-w-0 flex-1 items-center justify-between gap-2">
              {/* Name / Display ID */}
              <div className="card-title min-w-0 leading-tight">
                {admin ? patient.name : entry.displayId}
              </div>

              {/* Patient Badge */}
              {!admin && (
                <div
                  className={`badge badge-soft shrink-0 capitalize ${statusBadgeMap[entry.status]}`}
                >
                  {entry.status}
                </div>
              )}
            </div>
          </div>

          {/* Bottom Details */}
          <div className="flex flex-col items-start gap-x-4 gap-y-1 py-1">
            {/* Patient Badge */}
            {admin && (
              <div
                className={`badge badge-soft shrink-0 capitalize ${statusBadgeMap[entry.status]}`}
              >
                {entry.status}
              </div>
            )}

            {admin && (
              <div className="flex items-center gap-1">
                <IdentificationIcon className={`${iconSize} shrink-0`} />
                <p className={textSize}>{entry.displayId}</p>
              </div>
            )}

            <div className="flex items-center gap-1">
              <ClipboardDocumentListIcon className={`${iconSize} shrink-0`} />
              <p
                className={`${textSize} ${isHighPriority ? "text-error animate-pulse" : ""}`}
              >
                {service.name}
              </p>
            </div>

            <TimeStatus entry={entry} timeUntil={timeUntil} />
          </div>

          {admin && (
            <div className="w-full">
              <ActionButtons
                status={entry.status}
                setOpenCheckInModal={setOpenCheckInModal}
                setOpenStartModal={setOpenStartModal}
                setOpenEndModal={setOpenEndModal}
                setOpenCancelModal={setOpenCancelModal}
                isProviderAvailable={isProviderAvailable}
                fullWidth
              />
            </div>
          )}
        </div>

        {/* Desktop layout: left icon, right top/bottom content */}
        <div className="hidden min-w-0 items-start gap-4 md:flex">
          <div className="shrink-0 tabular-nums">
            <QueueIcon entry={entry} className="h-17.5 w-17.5" />
          </div>

          <div className="flex min-w-0 flex-1 flex-col gap-2 py-1">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="card-title min-w-0 truncate leading-tight">
                  {admin ? patient.name : entry.displayId}
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-3">
                <div
                  className={`badge badge-soft capitalize ${statusBadgeMap[entry.status]}`}
                >
                  {entry.status}
                </div>
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
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              {admin && (
                <div className="flex items-center gap-1">
                  <IdentificationIcon className={`${iconSize} shrink-0`} />
                  <p className={textSize}>{entry.displayId}</p>
                </div>
              )}

              <div className="flex items-center gap-1">
                <ClipboardDocumentListIcon className={`${iconSize} shrink-0`} />
                <p
                  className={`${textSize} ${isHighPriority ? "text-error animate-pulse" : ""}`}
                >
                  {service.name}
                </p>
              </div>
              <TimeStatus entry={entry} timeUntil={timeUntil} />
            </div>
          </div>
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
  fullWidth = false,
}: {
  status: QueueStatus;
  setOpenCheckInModal: (bool: boolean) => void;
  setOpenStartModal: (bool: boolean) => void;
  setOpenEndModal: (bool: boolean) => void;
  setOpenCancelModal: (bool: boolean) => void;
  isProviderAvailable: boolean;
  fullWidth?: boolean;
}) => {
  const flexWidth: string = " flex-1 min-w-25";

  return (
    <div className={fullWidth ? "w-full" : ""}>
      <div className={`join flex ${fullWidth ? "w-full" : ""}`}>
        {/* Main Button */}
        {status === "waiting" ? (
          <button
            className={`join-item btn ${flexWidth}`}
            onClick={() => setOpenCheckInModal(true)}
          >
            Check-in
          </button>
        ) : status === "ready" ? (
          <button
            className={`join-item btn ${flexWidth}`}
            onClick={() => setOpenStartModal(true)}
          >
            Start
          </button>
        ) : (
          <button
            className={`join-item btn ${flexWidth}`}
            onClick={() => setOpenEndModal(true)}
          >
            Finish
          </button>
        )}

        {/* Dropdown Button */}
        <div className="dropdown dropdown-end">
          <button tabIndex={0} role="button" className="join-item btn px-2">
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
