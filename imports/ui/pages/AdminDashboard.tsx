import React, { useState } from "react";
import { DashboardCard } from "../components/DashboardCard";
import { TEST_SETTINGS, WORKING_HOURS } from "/imports/dev/settings";
import { Clock } from "../components/Clock";
import {
  BriefcaseIcon,
  CalendarDaysIcon,
  ClockIcon,
  IdentificationIcon,
  NumberedListIcon,
} from "@heroicons/react/24/outline";
import {
  getEndOfDay,
  getStartOfDay,
  timeStrToLocaleTime,
} from "/imports/utils/utils";
import { AppointmentsCollection } from "/imports/api/appointment";
import { useFind, useSubscribe } from "meteor/react-meteor-data";
import { Loading } from "../components/Loading";
import { useDateTime } from "../../contexts/DateTimeContext";
import { QueueEntryCollection } from "/imports/api/queueEntry";
import { QueueList } from "../queue/QueueList";
import { AppointmentList } from "../appointment/AppointmentList";
import { ServicesCollection } from "/imports/api/service";
import { SettingsCollection } from "/imports/api/settings";
import { WorkdayModal } from "../dashboard/WorkdayModal";
import { ProviderCollection } from "/imports/api/provider";

export const AdminDashboard = () => {
  const now = useDateTime();
  const isSettingsLoading = useSubscribe("settings");
  const isAppointmentsLoading = useSubscribe("appointments");
  const isQueueEntriesLoading = useSubscribe("queue");
  const isServicesLoading = useSubscribe("services");
  const isProvidersLoading = useSubscribe("providers");

  // Settings and Workday
  const settings = useFind(() => SettingsCollection.find({}))[0];
  const dayStarted: boolean = settings?.day_started ?? false;
  const startOfDay: string = settings?.start_of_day;
  const endOfDay: string = settings?.end_of_day;
  const [isWorkdayModalOpen, setWorkdayModalOpen] = useState(false);

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

  // Providers
  const providers = useFind(() => ProviderCollection.find({}));

  // Queues
  const queue = useFind(() =>
    // Get queue entries made today that are still waiting or in-progress
    QueueEntryCollection.find({
      createdAt: { $gte: getStartOfDay(now), $lte: getEndOfDay(now) },
      status: { $in: ["waiting", "in-progress"] },
    }),
  );

  if (
    isAppointmentsLoading() ||
    isQueueEntriesLoading() ||
    isServicesLoading() ||
    isSettingsLoading() ||
    isProvidersLoading()
  )
    return <Loading />;

  return (
    <>
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>

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

          {/* Workday Dashboard Card */}
          <div className="my-4">
            <DashboardCard
              header="Workday"
              body={
                <div>
                  {dayStarted ? (
                    <p className="text-success-content text-center border border-success bg-success rounded px-2 py-0.5">
                      Open
                    </p>
                  ) : (
                    <p className="text-error-content text-center border border-error bg-error rounded px-2 py-0.5">
                      Closed
                    </p>
                  )}
                </div>
              }
              footer={`${timeStrToLocaleTime(startOfDay)} - ${timeStrToLocaleTime(endOfDay)}`}
              icon={BriefcaseIcon}
              onClick={() => {
                setWorkdayModalOpen(true);
              }}
            />
          </div>

          {/* Appointment Dashboard Card */}
          {/* <div className="my-4">
          <DashboardCard
            header="Appointments"
            body={appointments.length}
            footer={`Completed: ${appointments.filter((a) => a.status === "completed").length}`}
            icon={CalendarDaysIcon}
          />
        </div> */}

          {/* Queue Dashboard Card */}
          {dayStarted && (
            <>
              <div className="my-4">
                <DashboardCard
                  header="In Queue"
                  body={queue.filter((q) => q.status === "waiting").length}
                  footer={`Completed: ${queue.filter((q) => q.status === "completed").length}`}
                  icon={NumberedListIcon}
                />
              </div>

              {/* Available Doctors Card */}
              <div className="my-4">
                <DashboardCard
                  header="Available Providers"
                  body={
                    providers.filter((p) => p.services.some((s) => s.enabled))
                      .length
                  }
                  footer={`Unavailable: ${providers.filter((p) => !p.services.some((s) => s.enabled)).length}`}
                  icon={IdentificationIcon}
                />
              </div>
            </>
          )}
        </div>

        {/* Appointments */}
        {TEST_SETTINGS.ENABLE_TEST_PAGES && (
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
        )}

        {/* Queue */}
        {dayStarted && (
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
        )}
      </div>

      {/* Workday Modal */}
      {isWorkdayModalOpen && <WorkdayModal setOpen={setWorkdayModalOpen} />}
    </>
  );
};
