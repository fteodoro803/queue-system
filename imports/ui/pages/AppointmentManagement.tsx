import React, { useState } from "react";
import { MakeAppointmentModal } from "../appointment/MakeAppointmentModal";
import { AppointmentCard } from "../appointment/AppointmentCard";
import { useFind, useSubscribe } from "meteor/react-meteor-data";
import { AppointmentsCollection } from "/imports/api/appointment";
import { Loading } from "../components/Loading";
import { Clock } from "../components/Clock";
import { getEndOfDay, getStartOfDay } from "/imports/utils/utils";
import { DashboardCard } from "../components/DashboardCard";
import { CalendarIcon, ClockIcon } from "@heroicons/react/24/outline";

export const AppointmentManagement = () => {
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const isAppointmentsLoading = useSubscribe("appointments");

  const appointmentsToday = useFind(() =>
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

      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mt-6">
        {/* Calendar Dashboard Card */}
        <div className="my-4">
          <DashboardCard
            header={currentDateTime.toLocaleDateString(undefined, {
              weekday: "long",
            })}
            body={<Clock setTime={setCurrentDateTime} />}
            footer={currentDateTime.toLocaleDateString(undefined, {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
            icon={ClockIcon}
          />
        </div>

        {/* Appointment Dashboard Card */}
        <div className="my-4">
          <DashboardCard
            header="Appointments"
            body={appointmentsToday.length}
            footer={`Completed: ${appointmentsToday.filter((a) => a.status === "completed").length}`}
            icon={CalendarIcon}
          />
        </div>
      </div>

      {/* Today's Appointments */}
      <div className="py-4">
        <h1 className="text-l font-semibold">Upcoming Appointments:</h1>
        {appointmentsToday
          .filter((a) => a.status === "scheduled" || a.status === "in-progress")
          .map((a) => (
            <AppointmentCard key={a._id} appointment={a} />
          ))}
      </div>

      {/* Finished Appointments */}
      <div className="py-4">
        <h1 className="text-l font-semibold">Finished Appointments:</h1>
        {appointmentsToday
          .filter((a) => a.status === "completed" || a.status === "cancelled")
          .map((a) => (
            <AppointmentCard key={a._id} appointment={a} />
          ))}
      </div>

      {/* Appointment Modal */}
      {isAppointmentModalOpen && (
        <MakeAppointmentModal setOpen={setIsAppointmentModalOpen} />
      )}
    </>
  );
};
