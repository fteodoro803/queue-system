import React, { useState } from "react";
import { MakeAppointmentModal } from "../appointment/MakeAppointmentModal";
import { AppointmentCard } from "../appointment/AppointmentCard";
import { useFind, useSubscribe } from "meteor/react-meteor-data";
import { AppointmentsCollection } from "/imports/api/appointment";
import { Loading } from "../components/Loading";
import { DATE_TIME } from "/imports/dev/settings";

export const AppointmentManagement = () => {
  const isAppointmentsLoading = useSubscribe("appointments");
  const appointments = useFind(() =>
    AppointmentsCollection.find({}, { sort: { date: 1 } }),
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

      {/* Tab Groups */}
      {/* name of each tab group should be unique */}
      <div className="tabs tabs-border justify-center">
        <input
          type="radio"
          name="my_tabs_2"
          className="tab"
          aria-label="Upcoming"
          defaultChecked
        />
        <div className="tab-content border-base-300 bg-base-100 p-10">
          {/* Upcoming Appointments */}
          <div className="py-4">
            {/* <h1 className="text-l font-semibold">Upcoming Appointments:</h1> */}
            {appointments
              .filter(
                (a) => a.status === "scheduled" || a.status === "in-progress",
              )
              .map((a) => (
                <AppointmentCard key={a._id} appointment={a} />
              ))}
          </div>
        </div>

        <input
          type="radio"
          name="my_tabs_2"
          className="tab"
          aria-label="Finished"
        />
        <div className="tab-content border-base-300 bg-base-100 p-10">
          {/* Finished Appointments */}
          <div className="py-4">
            {/* <h1 className="text-l font-semibold">Finished Appointments:</h1> */}
            {appointments
              .filter(
                (a) =>
                  (a.status === "completed" || a.status === "cancelled") &&
                  a.scheduled_start.getDate() === DATE_TIME.getDate(),
              )
              .map((a) => (
                <AppointmentCard key={a._id} appointment={a} />
              ))}
          </div>
        </div>

        <input type="radio" name="my_tabs_2" className="tab" aria-label="All" />
        <div className="tab-content border-base-300 bg-base-100 p-10">
          {/* All Appointments */}
          <div className="py-4">
            {/* <h1 className="text-l font-semibold">All Appointments:</h1> */}
            {appointments.map((a) => (
              <AppointmentCard key={a._id} appointment={a} />
            ))}
          </div>
        </div>
      </div>

      {/* Appointment Modal */}
      {isAppointmentModalOpen && (
        <MakeAppointmentModal setOpen={setIsAppointmentModalOpen} />
      )}
    </>
  );
};
