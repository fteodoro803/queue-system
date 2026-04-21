import { QueueEntry } from "/imports/api/queueEntry";
import { Service } from "/imports/api/service";
import { Stats } from "/imports/api/stats";

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
        | "empty_queue";
    };

// Calculates the estimated total service time for a queue
// If an entry is supplied, calculates the estimated wait time for that entry.
export function calculateQueueTime({
  queue,
  queueEntry,
  service,
  activeProviders,
  currentTime,
  stats,
}: {
  queue: QueueEntry[];
  queueEntry?: QueueEntry;
  service: Service;
  activeProviders: number;
  currentTime: Date;
  stats?: Stats;
}): QueueTimeResult {
  // If entry has no position, we can't calculate wait time
  if (queueEntry && !queueEntry.position) {
    return { ok: false, reason: "invalid_position" };
  }

  // If no active providers, we can't estimate wait time
  if (!activeProviders || activeProviders <= 0)
    return { ok: false, reason: "no_providers" };

  // If entry is supplied but not in the queue or for a different service, return undefined
  if (queueEntry && queueEntry.serviceId !== service._id)
    return { ok: false, reason: "wrong_service" };

  // Service duration in minutes
  const averageDuration: number | undefined = stats
    ? stats.totalDuration / stats.count
    : undefined;
  const serviceDuration = averageDuration ?? service.duration;

  // 1. Get the time remaining for people being served ("in-progress")
  let remainingTime = 0;
  const inProgressEntries = queue.filter(
    (e) => e.serviceId === service._id && e.status === "in-progress",
  );
  for (const entry of inProgressEntries) {
    if (entry.start) {
      const timeElapsed =
        (currentTime.getTime() - entry.start.getTime()) / 60000;
      const timeLeft = Math.max(0, serviceDuration - timeElapsed);
      remainingTime += timeLeft;
    } else {
      // If start time is missing, assume full duration left
      remainingTime += serviceDuration;
    }
  }

  // 2a. Get waiting time for people "waiting"/"ready" ahead of the entry
  let timeOfWaitingAhead: number = 0;
  // People ahead of entry excluding the in-progress ones
  if (queueEntry) {
    const peopleAhead = queue.filter(
      (e) =>
        e.serviceId === service._id &&
        (e.status === "waiting" || e.status === "ready") &&
        e.position != null &&
        queueEntry.position != null &&
        e.position < queueEntry.position,
    ).length;
    timeOfWaitingAhead = peopleAhead * serviceDuration;
  }

  // 2b. If no entry supplied, calculate based on the full queue length for the service
  else {
    const numPeopleWaiting = queue.filter(
      (e) =>
        e.serviceId === service._id &&
        (e.status === "waiting" || e.status === "ready") &&
        e.position != null,
    ).length;

    timeOfWaitingAhead = numPeopleWaiting * serviceDuration;
  }

  // 3. Take into account the number of active providers for the service
  // Count active queue entries for this service (waiting, ready, in-progress)
  const activeQueueLength = queue.filter(
    (e) =>
      e.serviceId === service._id &&
      (e.status === "waiting" ||
        e.status === "in-progress" ||
        e.status === "ready"),
  ).length;
  if (activeQueueLength === 0) return { ok: true, time: 0 }; // If no one in queue, wait time is 0

  // Min used because if there are more providers than patients, it doesnt shorten the wait time
  const effectiveProviders = Math.min(
    Math.max(1, activeProviders),
    activeQueueLength,
  );

  // 4. Calculate total wait time
  const totalWaitTime: number = Math.ceil(
    (remainingTime + timeOfWaitingAhead) / effectiveProviders,
  );
  return { ok: true, time: totalWaitTime };
}
