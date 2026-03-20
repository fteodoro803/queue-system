import React from "react";
import { useDateTime } from "/imports/contexts/DateTimeContext";
import {
  CalendarDaysIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  WrenchIcon,
} from "@heroicons/react/24/outline";
import { QueueEntry, QueueEntryCollection } from "/imports/api/queueEntry";
import { useFind, useSubscribe } from "meteor/react-meteor-data";
import { convertMinutesToTime } from "/imports/utils/utils";
import { calculateQueueTime } from "/imports/utils/queueUtils";
import { ProviderCollection } from "/imports/api/provider";
import { Loading } from "../components/Loading";

export const QueueDetails = ({
  entry,
  setOpen,
}: {
  entry: QueueEntry | undefined;
  setOpen: (value: boolean) => void;
}) => {
  const now = useDateTime();
  const isProvidersLoading = useSubscribe("providers");
  const providers = useFind(() => ProviderCollection.find({}));
  const isQueueLoading = useSubscribe("queue");
  const queue = useFind(() =>
    QueueEntryCollection.find({ serviceId: entry?.service._id }),
  );

  // Calculate the number of active providers for the selected service
  const activeProviders = providers.filter((p) =>
    p.services.some((s) => s.id === entry?.service._id && s.enabled),
  ).length;

  const maxQueueLength = calculateQueueTime({
    queueEntry: entry,
    queue: queue,
    service: entry!.service,
    activeProviders: activeProviders,
    currentTime: now,
  });

  if (isProvidersLoading() || isQueueLoading()) return <Loading />;

  if (!entry || activeProviders === undefined) return null;
  const isPriority = entry.service.priority > 1;

  return (
    <div className="flex flex-col gap-4">
      {/* Joined Queue Alert */}
      <div role="alert" className="alert alert-success">
        <CheckCircleIcon className="h-6 w-6" />
        <span>
          You have joined the queue in{" "}
          <strong>position {entry.position}</strong>!
        </span>
      </div>

      {/* Queue ID Hero */}
      <div className="flex flex-col items-center py-6 gap-1">
        <p className="text-xs font-semibold text-base-content/40 uppercase tracking-widest">
          Queue ID
        </p>
        <p className="text-7xl font-black">{entry.displayId ?? "—"}</p>
        <div className="flex items-center gap-1.5 mt-2 text-base-content/50">
          <CalendarDaysIcon className="h-4 w-4" />
          <span className="text-sm">
            Est. wait:{" "}
            <span className="font-semibold text-base-content">
              {maxQueueLength !== undefined
                ? convertMinutesToTime(maxQueueLength)
                : "N/A (QueueLength undefined)"}
            </span>
          </span>
        </div>
      </div>

      {/* Divider */}
      <div className="divider text-xs text-base-content/30 uppercase tracking-wider">
        Details
      </div>

      {/* Summary rows */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-base-200">
          <WrenchIcon className="h-4 w-4 text-base-content/40 shrink-0" />
          <span className="text-sm text-base-content/60">Service</span>
          <span className="text-base-content/30">·</span>
          <span className="text-sm font-semibold">
            {entry.service?.name ?? "None"}
          </span>
        </div>

        <div className="flex items-center gap-3 p-3 rounded-lg bg-base-200">
          <CalendarDaysIcon className="h-4 w-4 text-base-content/40 shrink-0" />
          <span className="text-sm text-base-content/60">Date</span>
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

      {/* Priority warning */}
      {isPriority && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-error/10 ring-1 ring-error/30 text-error">
          <ExclamationTriangleIcon className="h-4 w-4 shrink-0" />
          <span className="text-sm font-medium">
            This is a high-priority service
          </span>
        </div>
      )}

      <button className="btn btn-primary w-full" onClick={() => setOpen(false)}>
        Close
      </button>
    </div>
  );
};
