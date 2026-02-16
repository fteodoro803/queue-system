import React from "react";
import { Appointment } from "/imports/api/appointment";
import {
  completeAppointment,
  cancelAppointment,
  startAppointment,
} from "/imports/api/appointmentMethods";
import { AcademicCapIcon } from "@heroicons/react/24/outline";
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
        <p>Patient Name: {appointment.patient.name}</p>
        <p>Service: {appointment.service.name}</p>
        <AcademicCapIcon className="size-6" />
        <p>Provider: {appointment.provider.name}</p>
        <p>Date: {appointment.date.toLocaleDateString()}</p>
        <p>Time: {appointment.date.toLocaleTimeString()}</p>
        <p>Status: {appointment.status}</p>

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
