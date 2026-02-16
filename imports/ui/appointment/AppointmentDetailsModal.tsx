import React from "react";
import { Appointment } from "/imports/api/appointment";
import {
  completeAppointment,
  cancelAppointment,
  startAppointment,
} from "/imports/api/appointmentMethods";
import {
  AcademicCapIcon,
  BellAlertIcon,
  CalendarDaysIcon,
  ClockIcon,
  UserIcon,
  WrenchScrewdriverIcon,
} from "@heroicons/react/24/outline";
import { GenericField } from "../components/GenericField";

export const AppointmentDetailsModal = ({
  appointment,
  isOpen,
}: {
  appointment: Appointment;
  isOpen: () => void;
}) => {
  const handleCancel = async () => {
    await cancelAppointment(appointment._id);
    isOpen();
  };

  const handleStart = async () => {
    await startAppointment(appointment._id);
    isOpen();
  };

  const handleComplete = async () => {
    await completeAppointment(appointment._id);
    isOpen();
  };

  return (
    <div className="modal modal-open" role={"dialog"}>
      <div className="modal-box flex flex-col gap-2">
        <button
          className="btn btn-sm btn-circle absolute right-2 top-2"
          onClick={isOpen}
        >
          ✕
        </button>

        {/* Details */}
        <p className="font-bold">Appointment Details</p>
        <GenericField
          value={appointment.patient.name}
          mode="read"
          additionalAttributes="input-ghost"
          icon={UserIcon}
        />
        <GenericField
          value={appointment.service.name}
          mode="read"
          additionalAttributes="input-ghost"
          icon={WrenchScrewdriverIcon}
        />
        <GenericField
          value={appointment.provider.name}
          mode="read"
          additionalAttributes="input-ghost"
          icon={AcademicCapIcon}
        />
        <GenericField
          value={appointment.date.toLocaleDateString()}
          mode="read"
          additionalAttributes="input-ghost"
          icon={CalendarDaysIcon}
        />
        <GenericField
          value={appointment.date.toLocaleTimeString()}
          mode="read"
          additionalAttributes="input-ghost"
          icon={ClockIcon}
        />
        <GenericField
          value={appointment.status}
          mode="read"
          additionalAttributes="input-ghost"
          icon={BellAlertIcon}
        />

        {/* Select State -- disabled for now */}
        {/* <select defaultValue={appointment.status} className="select">
          {APPOINTMENT_STATES.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select> */}

        {/* Cancel button */}
        <button className="btn btn-error mt-2" onClick={handleCancel}>
          Cancel Appointment
        </button>

        {/* Start button */}
        <button className="btn btn-warning mt-2" onClick={handleStart}>
          Start Appointment
        </button>

        {/* Mark as complete button */}
        <button className="btn btn-success mt-2" onClick={handleComplete}>
          Mark as Complete
        </button>
      </div>
    </div>
  );
};
