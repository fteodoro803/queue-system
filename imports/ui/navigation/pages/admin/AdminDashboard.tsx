import React, { useState } from "react";
import { DashboardCard } from "/imports/ui/components/DashboardCard";
import { Clock } from "/imports/ui/components/Clock";
import {
  BriefcaseIcon,
  ClockIcon,
  IdentificationIcon,
  NumberedListIcon,
} from "@heroicons/react/24/outline";
import {
  getEndOfDay,
  getStartOfDay,
  timeStrToLocaleTime,
} from "/imports/utils/utils";
import { useFind, useSubscribe } from "meteor/react-meteor-data";
import { Loading } from "/imports/ui/components/Loading";
import { useDateTime } from "/imports/contexts/DateTimeContext";
import { QueueEntryCollection } from "/imports/api/queueEntry";
import { Flags, Settings, SettingsCollection } from "/imports/api/settings";
import { WorkdayModal } from "/imports/ui/dashboard/WorkdayModal";
import { ProviderCollection } from "/imports/api/provider";

export const AdminDashboard = () => {
  const now = useDateTime();
  const isSettingsLoading = useSubscribe("settings");
  const isAppointmentsLoading = useSubscribe("appointments");
  const isQueueEntriesLoading = useSubscribe("queue");
  const isServicesLoading = useSubscribe("services");
  const isProvidersLoading = useSubscribe("providers");

  // Settings and Workday
  const settings: Settings | Flags = useFind(() =>
    SettingsCollection.find({ _id: "app_settings" }),
  )[0] as Settings;
  const dayStarted: boolean = settings?.day_started ?? false;
  const startOfDay: string = settings?.start_of_day;
  const endOfDay: string = settings?.end_of_day;
  const [isWorkdayModalOpen, setWorkdayModalOpen] = useState(false);

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
        <div className="flex flex-wrap gap-4 justify-start my-8">
          {/* Calendar Dashboard Card */}
          <div>
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
          <div className="cursor-pointer">
            <DashboardCard
              header="Workday"
              body={
                <div>
                  {dayStarted ? (
                    <p className="text-success text-center">Open</p>
                  ) : (
                    <p className="text-error text-center">Closed</p>
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

          {/* Queue Dashboard Card */}
          {dayStarted && (
            <>
              <div>
                <DashboardCard
                  header="In Queue"
                  body={queue.filter((q) => q.status === "waiting").length}
                  footer={`Completed: ${queue.filter((q) => q.status === "completed").length}`}
                  icon={NumberedListIcon}
                />
              </div>

              {/* Available Doctors Card */}
              <div>
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
      </div>

      {/* Workday Modal */}
      {isWorkdayModalOpen && <WorkdayModal setOpen={setWorkdayModalOpen} />}
    </>
  );
};
