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
import { Service} from "/imports/api/service";

interface QueueListItemProps {
  entry: QueueEntry;
  patient: Patient;
  service: Service;
  timeUntil?: QueueTimeResult;
  availableProviders?: number;
  admin?: boolean;
};

export const QueueListItem = ({ entry, patient, service, timeUntil, availableProviders, admin }: QueueListItemProps) => {
  const now = useDateTime();
  const iconSize: string = "size-6";
  const textSize: string = "text-sm";

  const isHighPriority = (service.priority ?? 0) > 1;

  const [openCancelModal, setOpenCancelModal] = useState(false);
  const [openStartModal, setOpenStartModal] = useState(false);
  const [openEndModal, setOpenEndModal] = useState(false);
  const [openCheckInModal, setOpenCheckInModal] = useState(false);

  const position = entry.position;

  // Ready if position is 1 or less than there are available providers
  const isProviderAvailable =
    position && availableProviders && position <= availableProviders;

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
          <div className="card-title">{patient.name}</div>

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
                {service.name}
              </p>
            </div>

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
            className={`badge badge-soft ml-auto ${statusBadgeMap[entry.status]}`}
          >
            {entry.status}
          </div>

          {/* Buttons */}
          <div>
            {/* Check-in Button */}
            {entry.status === "waiting" && (
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
            {entry.status === "ready" && (
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
      {openCheckInModal && (
        <CheckInModal setOpen={setOpenCheckInModal} entry={entry} now={now} />
      )}
    </>
  );
};
