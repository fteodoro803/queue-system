import React, { useState } from "react";
import { MakeAppointmentModal } from "../appointment/MakeAppointmentModal";
import { AppointmentCard } from "../appointment/AppointmentCard";
import { useFind, useSubscribe } from "meteor/react-meteor-data";
import { AppointmentsCollection } from "/imports/api/appointment";
import { Loading } from "../components/Loading";
import { Clock } from "../components/Clock";
import { getEndOfDay, getStartOfDay } from "/imports/utils/utils";

export const AppointmentManagement = () => {
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const isAppointmentsLoading = useSubscribe("appointments");
  const appointments = useFind(() =>
    AppointmentsCollection.find(
      {},
      {
        sort: { date: 1 }, // sort by date in ascending order
      },
    ),
  );
  const pastAppointments = appointments.filter((a) => a.date < currentDateTime);

  const todayAppointments = useFind(() =>
    AppointmentsCollection.find(
      {
        // find appointments where date is between start and end of current day
        date: {
          $gte: getStartOfDay(currentDateTime),
          $lte: getEndOfDay(currentDateTime),
        },
      },
      { sort: { date: 1 } },
    ),
  );

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
        <Clock setTime={setCurrentDateTime} />
      </div>

      {/* Today's Appointments */}
      <p>Todays Appointments:</p>
      {todayAppointments.map((a) => (
        <AppointmentCard key={a._id} appointment={a} />
      ))}

      {/* Past Appointments */}
      <p>Past Appointments:</p>
      {pastAppointments.map((a) => (
        <AppointmentCard key={a._id} appointment={a} />
      ))}

      {/* All Appointments */}
      <p>All Appointments:</p>
      {appointments.map((a) => (
        <AppointmentCard key={a._id} appointment={a} />
      ))}

      {/* Appointment Modal */}
      {isAppointmentModalOpen && (
        <MakeAppointmentModal setOpen={setIsAppointmentModalOpen} />
      )}
    </>
  );
};
