import { QueueEntry } from "../api/queueEntry";
import { Service } from "../api/service";

export function calculateEstimatedWaitTime(
  queueEntry: QueueEntry,
  queue: QueueEntry[],
  service: Service,
  activeProviders: number,
  currentTime: Date,
): number | undefined {
  if (queueEntry.position === undefined || queueEntry.position === null) {
    return undefined;
  }

  if (!activeProviders || activeProviders <= 0) return undefined;

  const serviceDuration = service.avgDuration ?? service.duration;

  // Find the currently in-progress entry for this service
  const inProgress = queue.find(
    (e) => e.serviceId === queueEntry.serviceId && e.position === 0,
  );

  // Find position 1 entry — they're probably being served even if not marked in-progress
  const positionOne = queue.find(
    (e) => e.serviceId === queueEntry.serviceId && e.position === 1,
  );

  const remainingTime = inProgress?.start
    ? // In-progress entry exists — count down from actual start time
      Math.max(
        0,
        serviceDuration -
          (currentTime.getTime() - inProgress.start.getTime()) / 60000,
      )
    : positionOne?.createdAt
      ? // No in-progress but someone is at position 1 — use their createdAt as proxy
        Math.max(
          0,
          serviceDuration -
            (currentTime.getTime() - positionOne.createdAt.getTime()) / 60000,
        )
      : // Nobody in queue ahead — full duration
        serviceDuration;

  // People ahead excluding the in-progress one (position 0)
  const peopleAhead = queueEntry.position - 1;

  // TODO: implement better doctor tracking later
  const effectiveProviders = Math.max(1, activeProviders); // Avoid division by zero

  // remaining time for current + full duration for everyone else ahead
  return Math.ceil(
    (remainingTime + peopleAhead * serviceDuration) / effectiveProviders,
  );
}
