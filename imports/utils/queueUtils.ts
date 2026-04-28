import { QueueEntry } from "/imports/api/queueEntry";
import { Service } from "/imports/api/service";
import { Stats } from "/imports/api/stats";
import { Provider } from "/imports/api/provider";

export const statusBadgeMap: Record<string, string> = {
  ready: "badge-success",
  waiting: "badge-info",
  "in-progress": "badge-warning",
  completed: "badge-success",
  cancelled: "badge-error",
};

export type QueueTimeResult =
  | { ok: true; time: number } // time in minutes
  | {
      ok: false;
      reason:
        | "no_providers"
        | "invalid_position"
        | "wrong_service"
        | "empty_queue"
        | "invalid_status";
    };

export function calculateQueueTime({
  queue,
  queueEntry,
  service,
  providers,
  currentTime,
  stats,
}: {
  queue: QueueEntry[];
  queueEntry?: QueueEntry;
  service: Service;
  providers: Provider[];
  currentTime: Date;
  stats?: Stats;
}): QueueTimeResult {
  // QueueEntry Guards
  if (queueEntry) {
    // wrong service
    if (queueEntry.serviceId !== service._id) {
      return { ok: false, reason: "wrong_service" };
    }

    // invalid position while waiting or ready
    if (
      (queueEntry.status === "waiting" || queueEntry.status === "ready") &&
      queueEntry.position == null
    ) {
      return { ok: false, reason: "invalid_position" };
    }

    if (queueEntry.status === "in-progress" && queueEntry.position != null) {
      return { ok: false, reason: "invalid_position" };
    }

    if (
      queueEntry.status === "completed" ||
      queueEntry.status === "cancelled"
    ) {
      return { ok: false, reason: "invalid_status" };
    }
  }

  // Filter to providers offering this service and are active
  const activeProviders = providers.filter(
    (p) =>
      p.active && p.services.some((s) => s.id === service._id && s.enabled),
  );

  if (activeProviders.length === 0) {
    return { ok: false, reason: "no_providers" };
  }

  // Service duration
  const serviceDuration =
    stats && stats.count > 0
      ? stats.totalDuration / stats.count
      : service.duration;

  // Build lane finish times
  const inProgress = queue.filter(
    (e) => e.serviceId === service._id && e.status === "in-progress",
  );

  // Start with in-progress entries occupying lanes
  const laneTimes: number[] = inProgress.map((entry) => {
    if (!entry.start) return serviceDuration;
    const elapsed = (currentTime.getTime() - entry.start.getTime()) / 60000;
    return Math.max(0, serviceDuration - elapsed);
  });

  // Fill remaining lanes with 0 (free providers)
  const freeLanes = activeProviders.length - inProgress.length;
  for (let i = 0; i < freeLanes; i++) {
    laneTimes.push(0);
  }

  // If queueEntry is in-progress, return its remaining time directly
  if (queueEntry?.status === "in-progress") {
    if (!queueEntry.start) return { ok: true, time: 0 };
    const elapsed =
      (currentTime.getTime() - queueEntry.start.getTime()) / 60000;
    return {
      ok: true,
      time: Math.ceil(Math.max(0, serviceDuration - elapsed)),
    };
  }

  // Get waiting patients in position order
  const waiting = queue
    .filter(
      (e) =>
        e.serviceId === service._id &&
        (e.status === "waiting" || e.status === "ready") &&
        e.position != null,
    )
    .sort((a, b) => a.position! - b.position!);

  if (waiting.length === 0) return { ok: true, time: 0 };

  // Assign each waiting patient to the earliest finishing lane
  let targetWaitTime: number | undefined;

  for (const entry of waiting) {
    // Find earliest finishing lane
    const earliestLane = laneTimes.indexOf(Math.min(...laneTimes));
    const waitTime = laneTimes[earliestLane];

    // If this is the entry we care about, record its wait time
    if (queueEntry && entry._id === queueEntry._id) {
      targetWaitTime = waitTime;
    }

    // Update lane
    laneTimes[earliestLane] += serviceDuration;
  }

  // Return specific entry wait time or total queue time
  if (queueEntry) {
    return targetWaitTime != null
      ? { ok: true, time: Math.ceil(targetWaitTime) }
      : { ok: false, reason: "invalid_position" };
  }

  // No entry supplied — return the time until the last patient is served
  return { ok: true, time: Math.ceil(Math.max(...laneTimes)) };
}
