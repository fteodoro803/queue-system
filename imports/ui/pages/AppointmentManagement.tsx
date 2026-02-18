import React, { useState } from "react";
import { MakeAppointmentModal } from "../appointment/MakeAppointmentModal";
import { AppointmentCard } from "../appointment/AppointmentCard";
import { useFind, useSubscribe } from "meteor/react-meteor-data";
import { AppointmentsCollection } from "/imports/api/appointment";
import { Loading } from "../components/Loading";
import { Clock } from "../components/Clock";

export const AppointmentManagement = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const isAppointmentsLoading = useSubscribe("appointments");
  const appointments = useFind(() =>
    AppointmentsCollection.find(
      {},
      {
        sort: { date: 1 }, // sort by date in ascending order
      },
    ),
  );
  const scheduledAppointments = appointments.filter(
    (a) => a.date >= currentTime,
  );
  const pastAppointments = appointments.filter((a) => a.date < currentTime);

  const [isAppointmentModalOpen, setIsAppointmentModalOpen] =
    useState<boolean>(false);

  // Return loading if appointments are not yet loaded
  if (isAppointmentsLoading()) return <Loading />;

  return (
    <>
      <div className="flex justify-between">
        <h1 className="text-3xl font-bold">Appointment Management</h1>

        <button
          className="btn btn-primary"
          onClick={() => {
            setIsAppointmentModalOpen(true);
          }}
        >
          + New Appointment
        </button>
      </div>

      {/* Current Time */}
      <div className="flex items-center gap-1">
        <p>Current Time:</p>
        <Clock setTime={setCurrentTime} />
      </div>

      {/* Upcoming Appointments */}
      <p>Upcoming Appointments:</p>
      {scheduledAppointments.map((a) => (
        <AppointmentCard key={a._id} appointment={a} />
      ))}

      {/* Past Appointments */}
      <p>Past Appointments:</p>
      {pastAppointments.map((a) => (
        <AppointmentCard key={a._id} appointment={a} />
      ))}

      {/* Appointment Modal */}
      {isAppointmentModalOpen && (
        <MakeAppointmentModal setOpen={setIsAppointmentModalOpen} />
      )}
    </>
  );
};
