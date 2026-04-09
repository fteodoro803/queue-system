import React, { useEffect, useState } from "react";
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
import { calculateQueueTime, QueueTimeResult } from "/imports/utils/queueUtils";
import { Provider, ProviderCollection } from "/imports/api/provider";
import { Loading } from "../components/Loading";
import { enqueue, QueueEntryData } from "/imports/api/queueEntryMethods";
import { Service } from "/imports/api/service";
import { getService } from "/imports/api/serviceMethods";

// Parent — only handles loading
export const QueueDetails = ({
  entryData,
  setOpen,
}: {
  entryData: QueueEntryData | undefined;
  setOpen: (value: boolean) => void;
}) => {
  const isProvidersLoading = useSubscribe("providers");
  const providers = useFind(() => ProviderCollection.find({}));
  const isQueueLoading = useSubscribe("queue");
  const queue = useFind(() =>
    QueueEntryCollection.find({ serviceId: entryData?.service?._id }),
  );

  if (isProvidersLoading() || isQueueLoading()) return <Loading />;

  return (
    <QueueDetailsContent
      entryData={entryData}
      setOpen={setOpen}
      providers={providers}
      queue={queue}
    />
  );
};

// Child — receives loaded data, safe to use all hooks
const QueueDetailsContent = ({
  entryData,
  setOpen,
  providers,
  queue,
}: {
  entryData: QueueEntryData | undefined;
  setOpen: (value: boolean) => void;
  providers: Provider[];
  queue: QueueEntry[];
}) => {
  const now = useDateTime();

  // ---- State & Derived Data ----
  const [entry, setEntry] = useState<QueueEntry | undefined>(undefined);
  const [service, setService] = useState<Service | undefined>(undefined);
  const [queueErrorReason, setQueueErrorReason] =
    useState<QueueFailureReason>();

  const activeProviders = providers.filter((p) =>
    p.services.some((s) => s.id === entryData?.service._id && s.enabled),
  ).length;

  // ---- Effects ----
  useEffect(() => {
    const enqueuePatient = async () => {
      if (entryData) {
        setQueueErrorReason(undefined);
        const estServiceTime: QueueTimeResult = calculateQueueTime({
          queue,
          service: entryData.service,
          activeProviders,
          currentTime: now,
        });

        // If an error is calculated, we shouldn't enqueue patient
        if (!estServiceTime.ok) {
          console.error("Cannot enqueue patient:", estServiceTime.reason);
          setQueueErrorReason(estServiceTime.reason);
          return;
        }

        const entryId = await enqueue(entryData, estServiceTime.time, now);
        const newEntry = await QueueEntryCollection.findOneAsync(entryId);
        setEntry(newEntry);

        const service = await getService(entryData.service._id);
        setService(service);
      }
    };
    enqueuePatient();
  }, [entryData]);

  // ---- Early Returns ----
  if (!entryData) return null;

  const maxQueueLength: QueueTimeResult = calculateQueueTime({
    queueEntry: entry,
    queue: queue,
    service: entryData.service,
    activeProviders: activeProviders,
    currentTime: now,
  });

  const effectiveFailureReason =
    queueErrorReason ||
    (!maxQueueLength.ok ? maxQueueLength.reason : undefined);

  if (effectiveFailureReason) {
    return (
      <div className="flex flex-col gap-4">
        <div role="alert" className="alert alert-error">
          <ExclamationTriangleIcon className="h-6 w-6" />
          <div>
            <p className="font-semibold">You could not be queued right now.</p>
            <p className="text-sm">
              {getQueueFailureMessage(effectiveFailureReason)}
            </p>
            <p className="text-sm">
              Please contact us directly or try again later!
            </p>
          </div>
        </div>

        <button
          className="btn btn-primary w-full"
          onClick={() => setOpen(false)}
        >
          Close
        </button>
      </div>
    );
  }

  if (!entry) return null;
  const isPriority = service && service.priority > 1;

  // ---- Render ----
  return (
    <div className="flex flex-col gap-4">
      {/* Joined Queue Alert */}
      <div role="alert" className="alert alert-success">
        <CheckCircleIcon className="h-6 w-6" />
        <span>
          You have joined the queue in{" "}
          <strong>position {entry?.position ?? "ERROR"}</strong>!
        </span>
      </div>

      {/* Queue ID Hero */}
      <div className="flex flex-col items-center py-6 gap-1">
        <p className="text-xs font-semibold text-base-content/40 uppercase tracking-widest">
          Queue ID
        </p>
        <p className="text-7xl font-black">{entry?.displayId ?? "ERROR"}</p>
        <div className="flex items-center gap-1.5 mt-2 text-base-content/50">
          <CalendarDaysIcon className="h-4 w-4" />
          <span className="text-sm">
            Est. wait:{" "}
            <span className="font-semibold text-base-content">
              {maxQueueLength.ok
                ? convertMinutesToTime(maxQueueLength.time)
                : "Unavailable"}
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
            {service ? service.name : "None"}
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

type QueueFailureReason = Exclude<QueueTimeResult, { ok: true }>["reason"];

const getQueueFailureMessage = (reason: QueueFailureReason) => {
  switch (reason) {
    case "no_providers":
      return "No providers are available for this service right now.";
    case "invalid_position":
      return "Unable to determine your queue position at the moment.";
    case "wrong_service":
      return "This queue entry does not match the selected service.";
    case "empty_queue":
      return "The queue information is currently unavailable.";
    default:
      return "Queueing is temporarily unavailable.";
  }
};
