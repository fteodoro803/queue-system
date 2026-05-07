import React, { useState } from "react";
import { QueueEntry, QueueStatus } from "/imports/api/queueEntry";
import {
  CheckIcon,
  ClockIcon,
  IdentificationIcon,
  PlayIcon,
  StopIcon,
  WifiIcon,
  XMarkIcon,
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
  showService?: boolean;
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

  const border: string =
    "after:absolute after:bottom-0 after:left-8 after:right-8 after:h-px after:bg-base-300/60 last:after:hidden";

  return (
    <>
      <li
        className={`relative px-4 py-3 hover:bg-base-200 ${border}`}
        key={entry._id}
      >
        {/* Mobile layout  */}
        <div className="flex min-w-0 flex-col gap-2 md:hidden">
          {/* Top Area */}
          <div className="flex min-w-0 items-center gap-3">
            {/* Left */}
            <div className="shrink-0 tabular-nums">
              {/* Queue Icon */}
              <QueueIcon
                entry={entry}
                className="h-14 w-14"
                isHighPriority={isHighPriority}
              />
            </div>

            {/* Right*/}
            <div className="flex min-w-0 flex-1 items-center justify-between gap-2">
              <div className="flex flex-col gap-1">
                {/* Name / Display ID */}
                <div className="card-title min-w-0 leading-tight truncate">
                  {admin ? patient.name : entry.displayId}
                </div>
                {/* Time Remaining when not Admin*/}
                {!admin && <TimeStatus entry={entry} timeUntil={timeUntil} />}
              </div>

              {/* Status Badge when not Admin */}
              {!admin && (
                <div
                  className={`badge badge-soft shrink-0 capitalize ${statusBadgeMap[entry.status]}`}
                >
                  {entry.status}
                </div>
              )}
            </div>
          </div>

          {/* Bottom Admin Details Area */}
          {admin && (
            <>
              <div className="flex flex-col items-start gap-x-4 gap-y-1 py-1">
                {/* Status Badge */}
                <div className="flex items-center gap-1">
                  <WifiIcon className={`${iconSize} shrink-0`} />
                  <div
                    className={`badge badge-soft shrink-0 capitalize ${statusBadgeMap[entry.status]}`}
                  >
                    {entry.status}
                  </div>
                </div>

                {/* Display ID */}
                <div className="flex items-center gap-4">
                  <IdentificationIcon className={`${iconSize} shrink-0`} />
                  <p className={textSize}>{entry.displayId}</p>
                </div>

                {/* Time Status */}
                <TimeStatus entry={entry} timeUntil={timeUntil} gap={4} />
              </div>

              <div className="w-full">
                <MobileActionButtons
                  status={entry.status}
                  setOpenCheckInModal={setOpenCheckInModal}
                  setOpenStartModal={setOpenStartModal}
                  setOpenEndModal={setOpenEndModal}
                  setOpenCancelModal={setOpenCancelModal}
                  isProviderAvailable={isProviderAvailable}
                  fullWidth
                />
              </div>
            </>
          )}
        </div>

        {/* Desktop layout: left icon, middle content, right badge/buttons */}
        <div className="hidden md:flex w-full min-w-0 items-center gap-4">
          {/* Icon */}
          <div className="shrink-0 tabular-nums">
            <QueueIcon entry={entry} isHighPriority={isHighPriority} />
          </div>

          {/* Details Column */}
          <div className="min-w-0 flex-1">
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
              <DesktopActionButtons
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
  gap = 1,
}: {
  entry: QueueEntry;
  timeUntil?: QueueTimeResult;
  gap?: number;
}) => {
  return (
    <>
      {/* Estimated Time Until */}
      {(entry.status === "waiting" || entry.status === "ready") &&
        timeUntil && (
          <div className={`flex items-center gap-${gap}`}>
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
        <div className={`flex items-center gap-${gap}`}>
          <ClockIcon className={iconSize} />
          <p className={textSize}>
            {entry.start ? `${formatDateToLocale(entry.start)}-present` : "N/A"}
          </p>
        </div>
      )}

      {/* Completed */}
      {entry.start && entry.end && (
        <div className={`flex items-center gap-${gap}`}>
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

const MobileActionButtons = ({
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

const DesktopActionButtons = ({
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
      {status !== "in-progress" && (
        <button
          className="btn btn-square btn-ghost"
          onClick={() => setOpenCancelModal(true)}
        >
          <XMarkIcon className="w-6" />
        </button>
      )}
    </div>
  );
};
