import { Meteor } from "meteor/meteor";
import { QUEUE_STATES, QueueEntry, QueueEntryCollection } from "./queueEntry";
import { Patient } from "./patient";
import { Service } from "./service";
import { updateServiceAnalytics } from "./serviceMethods";
import { CountersCollection } from "./counters";

export interface QueueEntryData {
  patient: Patient; // Replace with actual Patient type
  service: Service; // Replace with actual Service type
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
    // Get count from Counters Collection
    const counter = await CountersCollection.findOneAsync({
      _id: data.service._id,
    });
    const nextNum = (counter?.count ?? 0) + 1;
    await CountersCollection.upsertAsync(
      { _id: data.service._id },
      { $set: { count: nextNum } },
    );
    const numStr = `${String(nextNum).padStart(3, "0")}`;
    const serviceStr = `${data.service.name.substring(0, 2).toUpperCase()}`;
    const displayId = `${serviceStr}-${numStr}`;

    return QueueEntryCollection.insertAsync({
      displayId: displayId,
      patientId: data.patient._id,
      patient: data.patient,
      serviceId: data.service._id,
      service: data.service,
      position: newPosition,
      status: "waiting",
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
    await updatePositions(entry);

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
    await updatePositions(entry);
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
async function updatePositions(entry: QueueEntry): Promise<void> {
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
}
