import React from "react";
import { Appointment } from "/imports/api/appointment";
import {
  markAsCompleted,
  markAsCancelled,
  markAsStarted,
  markAsScheduled,
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
  setOpen,
}: {
  appointment: Appointment;
  setOpen: (value: boolean) => void;
}) => {
  const handleCancel = async () => {
    await markAsCancelled(appointment._id);
    setOpen(false);
  };

  const handleStart = async () => {
    await markAsStarted(appointment._id);
    setOpen(false);
  };

  const handleComplete = async () => {
    await markAsCompleted(appointment._id);
    setOpen(false);
  };

  const handleSchedule = async () => {
    await markAsScheduled(appointment._id);
    setOpen(false);
  };

  return (
    <div className="modal modal-open" role={"dialog"}>
      <div className="modal-box flex flex-col">
        <button
          className="btn btn-sm btn-circle absolute right-2 top-2"
          onClick={() => setOpen(false)}
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
          value={appointment.scheduled_start.toLocaleDateString()}
          mode="read"
          additionalAttributes="input-ghost"
          icon={CalendarDaysIcon}
        />
        <GenericField
          value={`${appointment.scheduled_start.toLocaleTimeString()} || ${appointment.actual_start ? `${appointment.actual_start.toLocaleTimeString()}` : "N/A"} - ${appointment.actual_end ? `${appointment.actual_end.toLocaleTimeString()}` : "N/A"}`}
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

        {/* Scheduled button (test) */}
        <button className="btn" onClick={handleSchedule}>
          Mark as Scheduled (test)
        </button>

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

      {/* Closes modal when clicking outside */}
      <div className="modal-backdrop" onClick={() => setOpen(false)} />
    </div>
  );
};
