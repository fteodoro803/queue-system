import React from "react";
import { Appointment } from "/imports/api/appointment";
import { APPOINTMENT_STATES } from "/imports/api/appointmentMethods";

export const AppointmentDetailsModal = ({
  appointment,
  isOpen,
}: {
  appointment: Appointment;
  isOpen: () => void;
}) => {
  return (
    <div className="modal modal-open" role={"dialog"}>
      <div className="modal-box">
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
        <p>Provider: {appointment.provider.name}</p>
        <p>Date: {appointment.date.toLocaleDateString()}</p>
        <p>Time: {appointment.date.toLocaleTimeString()}</p>

        <select defaultValue={appointment.status} className="select">
          {APPOINTMENT_STATES.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>

        {/* Delete button */}
        <button className="btn btn-error mt-4">Delete Appointment</button>

        {/* Mark as complete button */}
        <button className="btn btn-success mt-2">Mark as Complete</button>
      </div>
    </div>
  );
};
