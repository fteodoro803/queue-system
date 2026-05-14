import React, { useEffect, useState } from "react";
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
import { QueueList } from "/imports/ui/queue/QueueList";
import { ServiceSelector } from "/imports/ui/components/ServiceSelector";
import { Service, ServicesCollection } from "/imports/api/service";
import { Patient, PatientsCollection } from "/imports/api/patient";
import { getStatsQuery } from "/imports/api/statsMethods";

export const AdminDashboard = () => {
  const now = useDateTime();
  const isSettingsLoading = useSubscribe("settings");
  const isAppointmentsLoading = useSubscribe("appointments");
  const isQueueEntriesLoading = useSubscribe("queue");
  const isServicesLoading = useSubscribe("services");
  const isProvidersLoading = useSubscribe("providers");
  const isPatientsLoading = useSubscribe("patients");
  const isStatsLoading = useSubscribe("stats");

  // Settings and Workday
  const settings: Settings | Flags = useFind(() =>
    SettingsCollection.find({ _id: "app_settings" }),
  )[0] as Settings;
  const dayStarted: boolean = settings?.day_started ?? false;
  const startOfDay: string = settings?.start_of_day;
  const endOfDay: string = settings?.end_of_day;
  const [isWorkdayModalOpen, setWorkdayModalOpen] = useState(false);

  // Patients
  const patients = useFind(() => PatientsCollection.find({}));
  const patientMap: Map<string, Patient> = new Map(
    patients.map((p) => [p._id, p]),
  );

  // Services
  const services = useFind(() =>
    ServicesCollection.find({}, { sort: { name: 1 } }),
  );
  const [selectedService, setSelectedService] = useState<Service>();

  // Providers
  const providers = useFind(() => ProviderCollection.find({}));
  const activeProviders = providers.filter(
    (p) =>
      p.active &&
      p.services.some((s) => s.id === selectedService?._id && s.enabled),
  );
  const availableProviders = activeProviders.filter((p) => p.available).length;

  // Queues
  const queue = useFind(() =>
    // Get queue entries made today that are still waiting or in-progress
    QueueEntryCollection.find(
      {
        createdAt: { $gte: getStartOfDay(now), $lte: getEndOfDay(now) },
        status: { $in: ["waiting", "in-progress", "ready"] },
      },
      { sort: { serviceId: 1, position: 1 } },
    ),
  );

  const stats = useFind(
    () =>
      selectedService ? getStatsQuery(selectedService._id, now) : undefined,
    [selectedService],
  );

  // Select the first service by default when services are loaded
  useEffect(() => {
    if (services.length === 0) {
      setSelectedService(undefined);
      return;
    }

    setSelectedService((currentService) => {
      if (!currentService) return services[0];

      // Keep selection by id, but return the latest reactive object
      const updatedService = services.find(
        (service) => service._id === currentService._id,
      );
      return updatedService ?? services[0];
    });
  }, [services]);

  if (
    isAppointmentsLoading() ||
    isQueueEntriesLoading() ||
    isServicesLoading() ||
    isSettingsLoading() ||
    isProvidersLoading() ||
    isPatientsLoading() ||
    isStatsLoading()
  )
    return <Loading />;

  return (
    <>
      <div className="mx-4 sm:mx-8 lg:mx-8">
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

        <ServiceSelector
          services={services}
          selectedService={selectedService}
          setService={setSelectedService}
        />

        {/* Queues */}
        {selectedService && stats ? (
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2 mt-2">
            <div>
              <h2 className="text-xl font-bold mb-3">Waiting</h2>
              <QueueList
                queue={queue}
                service={selectedService}
                states={["ready", "waiting"]}
                providers={activeProviders}
                patientMap={patientMap}
                availableProviders={availableProviders}
                adminView={true}
                searchBar={true}
                stats={stats && stats.length > 0 ? stats[0] : undefined}
              />
            </div>

            <div>
              <h2 className="text-xl font-bold mb-3">Ongoing</h2>
              <QueueList
                queue={queue}
                service={selectedService}
                states={["in-progress"]}
                providers={activeProviders}
                patientMap={patientMap}
                adminView={true}
                searchBar={true}
              />
            </div>
          </div>
        ) : (
          <div className="py-8 text-center text-sm opacity-60">
            No services available.
          </div>
        )}
      </div>

      {/* Workday Modal */}
      {isWorkdayModalOpen && <WorkdayModal setOpen={setWorkdayModalOpen} />}
    </>
  );
};
