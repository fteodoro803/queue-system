import { Meteor } from "meteor/meteor";
import { QUEUE_STATES, QueueEntry, QueueEntryCollection } from "./queueEntry";
import { Patient } from "./patient";
import { Service } from "./service";
import { updateServiceAnalytics } from "./serviceMethods";
import { CountersCollection } from "./counters";

export interface QueueEntryData {
  patient: Patient; // Replace with actual Patient type
  service: Service; // Replace with actual Service type
  // initialExpectedWaitTime?: number; // in minutes, optional field for expected wait time at the moment of enqueueing
  // currentExpectedWaitTime?: number; // in minutes, optional field for current expected wait time, can be updated over time based on queue dynamics
}

type DequeueReason = Extract<
  (typeof QUEUE_STATES)[number],
  "cancelled" | "completed"
>;

// Client-Called methods
Meteor.methods({
  // Inserts queue entry to database and calculates position
  async "queueEntry.enqueue"(data: QueueEntryData, time: Date) {
    // 1. Get the current max position in the queue, for respective service
    const maxPositionEntry: QueueEntry | undefined =
      await QueueEntryCollection.findOneAsync(
        {
          position: { $ne: null },
          serviceId: data.service._id,
          status: "waiting",
        },
        { sort: { position: -1 } },
      );

    // 2. Set the position of the entry to max + 1 (or 1 if no entries in the queue)
    const newPosition = maxPositionEntry
      ? (maxPositionEntry.position || 0) + 1
      : 1;

    // 3. Generate display ID
    const displayId = await generateDisplayId(data.service);

    return QueueEntryCollection.insertAsync({
      displayId: displayId,
      patientId: data.patient._id,
      patient: data.patient,
      serviceId: data.service._id,
      service: data.service,
      position: newPosition,
      status: "waiting",
      // initialExpectedWaitTime: data.initialExpectedWaitTime ?? null,
      // currentExpectedWaitTime: data.currentExpectedWaitTime ?? null,
      readyAt: null,
      start: null, // Start time will be set once the service is started
      end: null, // End time will be set after the service is completed
      createdAt: time,
    });
  },

  // Removes queue entry from the database and updates positions of remaining entries
  async "queueEntry.dequeue"(id: string, reason: DequeueReason, time: Date) {
    const entry: QueueEntry | undefined =
      await QueueEntryCollection.findOneAsync(id);
    if (!entry) {
      throw new Meteor.Error("Queue entry not found");
    }

    if (entry.position === null) {
      throw new Meteor.Error(
        "Invalid queue entry position",
        "Cannot complete/cancel what isn't in queue",
      );
    }

    // 1. Update the status of the entry
    await QueueEntryCollection.updateAsync(id, {
      $set: {
        status: reason === "completed" ? "completed" : "cancelled",
        position: null,
        end: reason === "completed" ? time : null,
      },
    });

    // 2. Update positions of entries behind the dequeued entry
    await updatePositions(entry, time);

    // 3. Update Service Analytics if completed
    if (reason === "completed" && entry.start) {
      const startTime: Date = entry.start;
      const endTime: Date = time;
      const duration: number =
        (endTime.getTime() - startTime.getTime()) / 60000; // duration in minutes
      await updateServiceAnalytics(entry.serviceId, duration);
    }
  },

  // Starts a Service
  async "queueEntry.startService"(id: string, time: Date) {
    const entry: QueueEntry | undefined =
      await QueueEntryCollection.findOneAsync(id);
    if (!entry) {
      throw new Meteor.Error("Queue entry not found");
    }

    // Only entries that are in the queue (position > 0) can be started
    if (entry.position === null || entry.position <= 0) {
      throw new Meteor.Error("Invalid queue entry position");
    }

    // 1. Update the status of the entry
    await QueueEntryCollection.updateAsync(id, {
      $set: {
        status: "in-progress",
        position: 0, // Set position to 0 to indicate it's being served, maybe temporary?
        start: time,
      },
    });

    // 2. Update positions of entries behind the dequeued entry
    await updatePositions(entry, time);
  },
});

// Enqueues a patient to a service queue
export async function enqueue(
  data: QueueEntryData,
  time: Date,
): Promise<string> {
  return await Meteor.callAsync("queueEntry.enqueue", data, time);
}

// Starts a service for a queue entry
export async function startService(id: string, time: Date): Promise<void> {
  await Meteor.callAsync("queueEntry.startService", id, time);
}

// Completes a service for a queue entry and removes it from the queue
export async function completeService(id: string, time: Date): Promise<void> {
  await Meteor.callAsync("queueEntry.dequeue", id, "completed", time);
}

// Cancels a queue entry
export async function cancelService(id: string, time: Date): Promise<void> {
  await Meteor.callAsync("queueEntry.dequeue", id, "cancelled", time);
}

// Updates positions of next queue entries for a service
async function updatePositions(entry: QueueEntry, time: Date): Promise<void> {
  // If the entry is not in the queue, no need to update positions
  if (entry.position === null || entry.position <= 0) return;

  await QueueEntryCollection.updateAsync(
    // 1. filter for entries of the same service that are behind the current entry in the queue
    {
      serviceId: entry.serviceId,
      $and: [{ position: { $gt: entry.position } }, { position: { $gt: 1 } }],
    },

    // 2. decrement positions of entries behind the current entry
    { $inc: { position: -1 } },

    // 3. all matches
    { multi: true },
  );

  // 2. Find whoever just moved to position 1
  const newPositionOne = await QueueEntryCollection.findOneAsync({
    serviceId: entry.serviceId,
    position: 1,
  });

  // 3. Mark them as ready
  if (newPositionOne) {
    await markAsReady(newPositionOne._id, time);
  }
}

// Generate Display ID
// TODO: fix potential for race condition between upsert and findOne
// TODO: what if two services have the same initials? (e.g., "General Consultation" and "General Checkup" both being "GE")
async function generateDisplayId(service: Service): Promise<string> {
  // 1. Get count from Counters Collection
  const counter = await CountersCollection.findOneAsync({
    // _id: service._id,
    _id: "placeholderId",
  });
  const currentCount = counter?.count ?? 0;

  // 2. Wrap to 1 after 99
  const nextNum = currentCount >= 99 ? 1 : currentCount + 1;

  // 3. Update count in Counters Collection
  await CountersCollection.upsertAsync(
    // { _id: service._id },
    { _id: "placeholderId" },
    { $set: { count: nextNum } },
  );

  // 4. Combine initials and count to generate ID (e.g., "AB-12")
  const numStr = `${String(nextNum).padStart(2, "0")}`;
  const serviceStr = `${service.shortcode.toUpperCase()}`;
  const displayId = `${serviceStr}-${numStr}`;

  return displayId;
}

// Marks a queue entry as ready (used for timing)
async function markAsReady(id: string, time: Date): Promise<void> {
  await QueueEntryCollection.updateAsync(id, {
    $set: {
      readyAt: time,
      status: "ready",
    },
  });
}
