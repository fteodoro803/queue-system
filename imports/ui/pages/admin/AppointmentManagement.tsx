import React, { useState } from "react";
import { MakeAppointmentModal } from "../../appointment/MakeAppointmentModal";
import { useFind, useSubscribe } from "meteor/react-meteor-data";
import { AppointmentsCollection } from "/imports/api/appointment";
import { Loading } from "../../components/Loading";
import { useDateTime } from "../../../contexts/DateTimeContext";
import { AppointmentList } from "../../appointment/AppointmentList";

export const AppointmentManagement = () => {
  const isAppointmentsLoading = useSubscribe("appointments");
  const now = useDateTime(); // context date and time
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
        {/* Upcoming Appointments */}
        <input
          type="radio"
          name="my_tabs_2"
          className="tab"
          aria-label="Upcoming"
          defaultChecked
        />
        <div className="tab-content border-base-300 bg-base-100 p-10">
          <div className="py-4">
            <AppointmentList
              appointments={appointments.filter(
                (a) => a.status === "scheduled" || a.status === "in-progress",
              )}
            />
          </div>
        </div>

        {/* Finished Appointments */}
        <input
          type="radio"
          name="my_tabs_2"
          className="tab"
          aria-label="Finished"
        />
        <div className="tab-content border-base-300 bg-base-100 p-10">
          <div className="py-4">
            <AppointmentList
              appointments={appointments.filter(
                (a) =>
                  (a.status === "completed" || a.status === "cancelled") &&
                  a.scheduled_start.getDate() === now.getDate(),
              )}
            />
          </div>
        </div>

        {/* All Appointments */}
        <input type="radio" name="my_tabs_2" className="tab" aria-label="All" />
        <div className="tab-content border-base-300 bg-base-100 p-10">
          <div className="py-4">
            <AppointmentList appointments={appointments} />
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
