import React from "react";
import { Appointment } from "/imports/api/appointment";
import {
  AcademicCapIcon,
  ClipboardDocumentListIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { DateIcon } from "../components/DateIcon";
import { formatDateToLocale } from "/imports/utils/utils";

export const AppointmentListItem = ({
  appointment,
  onClick,
}: {
  appointment: Appointment;
  onClick: () => void;
}) => {
  const iconSize: string = "size-6";
  const textSize: string = "text-sm";

  const statusBadgeMap: Record<string, string> = {
    scheduled: "badge-info",
    "in-progress": "badge-warning",
    completed: "badge-success",
    cancelled: "badge-error",
  };

  return (
    <li
      className="list-row hover:bg-base-200"
      key={appointment._id}
      onClick={onClick}
    >
      {/* Icon */}
      <div className="tabular-nums">
        <DateIcon date={appointment.scheduled_start} />
      </div>

      {/* Details Column */}
      <div className="list-col-grow py-1">
        {/* Patient Name */}
        <div className="card-title">{appointment.patient.name}</div>

        {/* Body */}
        <div className="flex items-center gap-4 py-1">
          {/* Time */}
          <div className="flex items-center gap-1">
            <ClockIcon className={iconSize} />
            <p className={textSize}>
              {formatDateToLocale(appointment.scheduled_start)}
            </p>
          </div>

          {/* Service */}
          <div className="flex items-center gap-1">
            <ClipboardDocumentListIcon className={iconSize} />
            <p className={textSize}>{appointment.service.name ?? "N/A"}</p>
          </div>

          {/* Provider */}
          <div className="flex items-center gap-1">
            <AcademicCapIcon className={iconSize} />
            <p className={textSize}>{appointment.provider.name ?? "N/A"}</p>
          </div>

          {/* Status */}
          <div
            className={`badge badge-soft ml-auto ${statusBadgeMap[appointment.status]}`}
          >
            {appointment.status}
          </div>
        </div>
      </div>
    </li>
  );
};
