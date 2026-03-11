import React from "react";
import { DashboardCard } from "../components/DashboardCard";
import { WORKING_HOURS } from "/imports/dev/settings";
import { Clock } from "../components/Clock";
import {
  CalendarDaysIcon,
  ClockIcon,
  NumberedListIcon,
} from "@heroicons/react/24/outline";
import { getEndOfDay, getStartOfDay } from "/imports/utils/utils";
import { AppointmentsCollection } from "/imports/api/appointment";
import { useFind, useSubscribe } from "meteor/react-meteor-data";
import { Loading } from "../components/Loading";
import { useDateTime } from "../../contexts/DateTimeContext";
import { QueueEntryCollection } from "/imports/api/queueEntry";
import { QueueList } from "../queue/QueueList";
import { AppointmentList } from "../appointment/AppointmentList";
import { ServicesCollection } from "/imports/api/service";

export const AdminDashboard = () => {
  const now = useDateTime();
  const isAppointmentsLoading = useSubscribe("appointments");
  const isQueueEntriesLoading = useSubscribe("queue");
  const isServicesLoading = useSubscribe("services");

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

  // Services
  const services = useFind(() => ServicesCollection.find({}));

  // Queues
  const queue = useFind(() =>
    // Get queue entries made today that are still waiting or in-progress
    QueueEntryCollection.find({
      createdAt: { $gte: getStartOfDay(now), $lte: getEndOfDay(now) },
      status: { $in: ["waiting", "in-progress"] },
    }),
  );

  if (isAppointmentsLoading() || isQueueEntriesLoading() || isServicesLoading())
    return <Loading />;

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
            icon={CalendarDaysIcon}
          />
        </div>

        {/* Queue Dashboard Card */}
        <div className="my-4">
          <DashboardCard
            header="In Queue"
            body={queue.filter((q) => q.status === "waiting").length}
            footer={`Completed: ${queue.filter((q) => q.status === "completed").length}`}
            icon={NumberedListIcon}
          />
        </div>
      </div>

      {/* Appointments */}
      <div className="py-4">
        <h1 className="text-l font-semibold">
          Upcoming and Ongoing Appointments:
        </h1>
        <AppointmentList
          appointments={appointments
            .filter(
              (a) =>
                a.scheduled_start.getDate() === now.getDate() &&
                (a.status === "scheduled" || a.status === "in-progress"),
            )
            .sort(
              (a, b) =>
                a.scheduled_start.getTime() - b.scheduled_start.getTime(),
            )}
        />
      </div>

      {/* Queue */}
      <div className="py-4">
        <h1 className="text-l font-semibold">Queue:</h1>
        {/* <QueueList queue={queue} /> */}
        {services.map((service) => {
          const serviceQueue = queue.filter(
            (entry) => entry.serviceId === service._id,
          );
          return (
            <div key={service._id} className="mb-2">
              <QueueList
                queue={serviceQueue}
                service={service}
                adminView={true}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
