import React from "react";
import { DashboardCard } from "../components/DashboardCard";
import { WORKING_HOURS } from "/imports/dev/settings";
import { Clock } from "../components/Clock";
import { CalendarIcon, ClockIcon } from "@heroicons/react/24/outline";
import { getEndOfDay, getStartOfDay } from "/imports/utils/utils";
import { AppointmentsCollection } from "/imports/api/appointment";
import { useFind, useSubscribe } from "meteor/react-meteor-data";
import { AppointmentCard } from "../appointment/AppointmentCard";
import { Loading } from "../components/Loading";
import { useDateTime } from "../../contexts/DateTimeContext";

export const AdminDashboard = () => {
  const now = useDateTime();
  const isAppointmentsLoading = useSubscribe("appointments");

  // Find appointments for the current day
  const appointments = useFind(() =>
    AppointmentsCollection.find(
      {
        // find appointments where date is between start and end of current day
        scheduled_start: {
          $gte: getStartOfDay(now),
          $lte: getEndOfDay(now),
        },
      },
      { sort: { date: 1 } },
    ),
  );

  if (isAppointmentsLoading()) return <Loading />;

  return (
    <div>
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>

      <h3 className="text-lg font-semibold">
        Work day: {WORKING_HOURS.startTime} - {WORKING_HOURS.endTime}
      </h3>

      {/* Dashboard Cards */}
      {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mt-6"> */}
      <div className="flex flex-wrap gap-4 justify-start mt-6">
        {/* Calendar Dashboard Card */}
        <div className="my-4">
          <DashboardCard
            header={now.toLocaleDateString(undefined, {
              weekday: "long",
            })}
            body={<Clock />}
            footer={now.toLocaleDateString(undefined, {
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
            body={appointments.length}
            footer={`Completed: ${appointments.filter((a) => a.status === "completed").length}`}
            icon={CalendarIcon}
          />
        </div>

        {/* Duration Dashboard Card */}
        <div className="my-4">
          <DashboardCard
            header="Duration"
            body={appointments.length}
            footer={`Completed: ${appointments.filter((a) => a.status === "completed").length}`}
            icon={CalendarIcon}
          />
        </div>
      </div>

      {/* Today's Appointments */}
      <div className="py-4">
        <h1 className="text-l font-semibold">Upcoming Appointments:</h1>
        {appointments
          .filter(
            (a) =>
              a.scheduled_start.getDate() === now.getDate() &&
              a.status === "scheduled",
          )
          .map((a) => (
            <AppointmentCard key={a._id} appointment={a} />
          ))}
      </div>

      {/* In-Progress Appointments */}
      <div className="py-4">
        <h1 className="text-l font-semibold">Ongoing Appointments:</h1>
        {appointments
          .filter(
            (a) =>
              a.scheduled_start.getDate() === now.getDate() &&
              a.status === "in-progress",
          )
          .map((a) => (
            <AppointmentCard key={a._id} appointment={a} />
          ))}
      </div>

      {/* Completed Appointments */}
      <div className="py-4">
        <h1 className="text-l font-semibold">Completed Appointments:</h1>
        {appointments
          .filter(
            (a) =>
              a.scheduled_start.getDate() === now.getDate() &&
              a.status === "completed",
          )
          .map((a) => (
            <AppointmentCard key={a._id} appointment={a} />
          ))}
      </div>
    </div>
  );
};
