import React, { useState } from "react";
import { MakeAppointmentModal } from "../appointment/MakeAppointmentModal";
import { AppointmentCard } from "../appointment/AppointmentCard";
import { useFind, useSubscribe } from "meteor/react-meteor-data";
import { AppointmentsCollection } from "/imports/api/appointment";
import { Loading } from "../components/Loading";

export const AppointmentManagement = () => {
  const isAppointmentsLoaded = useSubscribe("appointments");
  const appointments = useFind(() => AppointmentsCollection.find());

  const [isAppointmentModalOpen, setIsAppointmentModalOpen] =
    useState<boolean>(false);

  if (isAppointmentsLoaded()) return <Loading />;

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

      {isAppointmentModalOpen && (
        <MakeAppointmentModal setOpen={setIsAppointmentModalOpen} />
      )}

      <p>Appointments:</p>
      {appointments.map((a) => {
        return <AppointmentCard key={a._id} appointment={a} />;
      })}
    </>
  );
};
