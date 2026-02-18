import React from "react";
import { DateIcon } from "../components/DateIcon";
import {
  AcademicCapIcon,
  ClipboardDocumentListIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { Appointment } from "/imports/api/appointment";
import { AppointmentDetailsModal } from "./AppointmentDetailsModal";

export const AppointmentCard = ({
  appointment,
}: {
  appointment: Appointment;
}) => {
  const hours = (appointment.date.getHours() % 12 || 12)
    .toString()
    .padStart(2, "0");
  const minutes = appointment.date.getMinutes().toString().padStart(2, "0");
  const amPm = appointment.date.getHours() >= 12 ? "PM" : "AM";
  const time: string = `${hours}:${minutes} ${amPm}`;

  const iconSize: string = "size-6";
  const textSize: string = "text-sm";
  const [isModalOpen, setIsModalOpen] = React.useState<boolean>(false);

  const statusBadgeMap: Record<string, string> = {
    scheduled: "badge-info",
    ongoing: "badge-warning",
    completed: "badge-success",
    cancelled: "badge-error",
  };

  return (
    <>
      <div
        className="card card-border w-160 bg-base-100 card-sm shadow-sm flex card-side hover:bg-base-200"
        onClick={() => setIsModalOpen(true)}
      >
        <figure className="p-3">
          <DateIcon date={appointment.date} size={70} />
        </figure>
        <div className="card-body">
          {/* Patient Name */}
          <h2 className="card-title">{appointment.patient.name ?? "N/A"}</h2>
          {/* More appointment details */}
          <div className="flex gap-7">
            {/* Time */}
            <div className="flex items-center gap-1">
              <ClockIcon className={iconSize} />
              <p className={textSize}>{time ?? "N/A"}</p>
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
              className={`badge badge-soft ${statusBadgeMap[appointment.status]}`}
            >
              {appointment.status}
            </div>
          </div>
        </div>
      </div>

      {/* Appointment Details Modal */}
      {isModalOpen && (
        <AppointmentDetailsModal
          appointment={appointment}
          setOpen={setIsModalOpen}
        />
      )}
    </>
  );
};
