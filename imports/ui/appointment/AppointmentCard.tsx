import React from "react";
import { DateIcon } from "../components/DateIcon";
import {
  ClockIcon,
  CogIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import { Appointment } from "/imports/api/appointment";

export const AppointmentCard = ({
  appointment,
}: {
  appointment: Appointment;
}) => {
  const hours = appointment.date.getHours().toString().padStart(2, "0");
  const minutes = appointment.date.getMinutes().toString().padStart(2, "0");
  const time: string = `${hours}:${minutes}`;

  const iconSize: string = "size-6";
  const textSize: string = "text-sm";

  return (
    <>
      <div className="card card-border w-160 bg-base-100 card-sm shadow-sm flex card-side">
        <figure className="p-3">
          <DateIcon date={appointment.date} size={70} />
        </figure>
        <div className="card-body">
          {/* Patient Name */}
          <h2 className="card-title">Patient Name</h2>
          {/* More appointment details */}
          <div className="flex gap-7">
            {/* Time */}
            <div className="flex items-center gap-1">
              <ClockIcon className={iconSize} />
              <p className={textSize}>{time ?? "N/A"}</p>
            </div>
            {/* Service */}
            <div className="flex items-center gap-1">
              <CogIcon className={iconSize} />
              <p className={textSize}>{appointment.service.name ?? "N/A"}</p>
            </div>
            {/* Provider */}
            <div className="flex items-center gap-1">
              <UserCircleIcon className={iconSize} />
              <p className={textSize}>{appointment.provider.name ?? "N/A"}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
