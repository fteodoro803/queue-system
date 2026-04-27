import React from "react";
import { Service } from "/imports/api/service";
import { Patient } from "/imports/api/patient";
import { QueueEntryData } from "/imports/api/queueEntryMethods";
import { useDateTime } from "/imports/contexts/DateTimeContext";
import {
  CalendarDaysIcon,
  EnvelopeIcon,
  ExclamationTriangleIcon,
  PhoneIcon,
  UserIcon,
  WrenchIcon,
} from "@heroicons/react/24/outline";
import { QueueEntryCollection } from "/imports/api/queueEntry";
import { useFind, useSubscribe } from "meteor/react-meteor-data";
import { Loading } from "/imports/ui/components/Loading";
import { getStatsQuery } from "/imports/api/statsMethods";
import { calculateQueueTime } from "/imports/utils/queueUtils";
import { ProviderCollection } from "/imports/api/provider";
import { convertMinutesToTime } from "/imports/utils/utils";

export const QueueConfirmation = ({
  patient,
  service,
  setQueueEntry,
}: {
  patient: Patient;
  service: Service;
  setQueueEntry: (entry: QueueEntryData) => void;
}) => {
  const now = useDateTime();
  const isQueueLoading = useSubscribe("queue");
  const queue = useFind(() =>
    QueueEntryCollection.find({ serviceId: service._id }),
  );
  const isStatsLoading = useSubscribe("stats");
  const stats = useFind(() => getStatsQuery(service._id, now), [service._id]);

  const isProvidersLoading = useSubscribe("providers");
  const providers = useFind(() => ProviderCollection.find({})); // TODO: optimize to only fetch providers relevant to the service

  const isPriority = (service.priority ?? 0) > 1;
  const hasEmail = patient.email != undefined;
  const hasNumber = patient.number != undefined;

  // Handlers
  const handleSubmit = async () => {
    if (!patient || !service) return;

    const newQueueEntry: QueueEntryData = {
      patient: patient,
      service: service,
    };

    setQueueEntry(newQueueEntry);
  };

  if (isQueueLoading() || isStatsLoading() || isProvidersLoading()) {
    return <Loading />;
  }

  const queueTimeResult = calculateQueueTime({
    queue,
    service,
    providers,
    currentTime: now,
    stats: stats && stats.length > 0 ? stats[0] : undefined,
  });
  const queueTime = queueTimeResult.ok
    ? `${convertMinutesToTime(queueTimeResult.time)} min`
    : undefined;

  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs font-semibold text-base-content/50 uppercase tracking-wider">
        Confirm Your Details
      </p>

      {/* Summary rows */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-base-200">
          <div className="w-18 flex items-center gap-3">
            <UserIcon className="h-4 w-4 text-base-content/40 shrink-0" />
            <span className="text-sm text-base-content/60">Patient</span>
          </div>
          <span className="text-base-content/30">·</span>
          <span className="text-sm font-semibold">
            {patient.name ?? "None"}
          </span>
        </div>

        {hasNumber && (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-base-200">
            <div className="w-18 flex items-center gap-3">
              <PhoneIcon className="h-4 w-4 text-base-content/40 shrink-0" />
              <span className="text-sm text-base-content/60">Number</span>
            </div>
            <span className="text-base-content/30">·</span>
            <span className="text-sm font-semibold">
              {patient.number ?? "None"}
            </span>
          </div>
        )}

        {hasEmail && (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-base-200">
            <div className="w-18 flex items-center gap-3">
              <EnvelopeIcon className="h-4 w-4 text-base-content/40 shrink-0" />
              <span className="text-sm text-base-content/60">Email</span>
            </div>
            <span className="text-base-content/30">·</span>
            <span className="text-sm font-semibold">
              {patient.email ?? "None"}
            </span>
          </div>
        )}

        <div className="flex items-center gap-3 p-3 rounded-lg bg-base-200">
          <div className="w-18 flex items-center gap-3">
            <WrenchIcon className="h-4 w-4 text-base-content/40 shrink-0" />
            <span className="text-sm text-base-content/60">Service</span>
          </div>
          <span className="text-base-content/30">·</span>
          <span className="text-sm font-semibold">
            {service.name ?? "None"}
          </span>
        </div>

        <div className="flex items-center gap-3 p-3 rounded-lg bg-base-200">
          <div className="w-18 flex items-center gap-3">
            <CalendarDaysIcon className="h-4 w-4 text-base-content/40 shrink-0" />
            <span className="text-sm text-base-content/60">Date</span>
          </div>
          <span className="text-base-content/30">·</span>
          <span className="text-sm font-semibold">
            {now.toLocaleDateString(undefined, {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        </div>
      </div>

      {/* Queue Time estimate */}
      {queueTimeResult.ok && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-warning/10 ring-1 ring-warning/30 text-warning">
          <ExclamationTriangleIcon className="h-4 w-4 shrink-0" />
          <span className="text-sm font-medium">
            Estimated wait time:{" "}
            <span className="font-semibold">{queueTime}</span>
          </span>
        </div>
      )}

      {/* Priority warning */}
      {isPriority && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-error/10 ring-1 ring-error/30 text-error">
          <ExclamationTriangleIcon className="h-4 w-4 shrink-0" />
          <span className="text-sm font-medium">
            This is a high-priority service
          </span>
        </div>
      )}

      <button
        className="btn btn-primary w-full"
        onClick={() => {
          handleSubmit();
        }}
      >
        Confirm
      </button>
    </div>
  );
};
