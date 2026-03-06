import { Meteor } from "meteor/meteor";
import { QUEUE_STATES, QueueEntryCollection } from "./queueEntry";
import { Patient } from "./patient";
import { Service } from "./service";
import { updateServiceAnalytics } from "./serviceMethods";

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
  async "queueEntry.enqueue"(data: QueueEntryData) {
    // 1. Get the current max position in the queue, for respective service
    const maxPositionEntry = await QueueEntryCollection.findOneAsync(
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

    return QueueEntryCollection.insertAsync({
      patientId: data.patient._id,
      patient: data.patient,
      serviceId: data.service._id,
      service: data.service,
      position: newPosition, // Position will be calculated on the server
      status: "waiting",
      start: null, // Start time will be set once the service is started
      end: null, // End time will be set after the service is completed
      createdAt: new Date(),
    });
  },

  // Removes queue entry from the database and updates positions of remaining entries
  async "queueEntry.dequeue"(id: string, reason: DequeueReason, time: Date) {
    const entry = await QueueEntryCollection.findOneAsync(id);
    if (!entry) {
      throw new Meteor.Error("Queue entry not found");
    }

    if (entry.position === null) {
      throw new Meteor.Error("Invalid queue entry position");
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
    await QueueEntryCollection.updateAsync(
      { serviceId: entry.serviceId, position: { $gt: entry.position } }, // filter
      { $inc: { position: -1 } }, // decrement
      { multi: true }, // all matches
    );

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
    const entry = await QueueEntryCollection.findOneAsync(id);
    if (!entry) {
      throw new Meteor.Error("Queue entry not found");
    }

    if (entry.position === null) {
      throw new Meteor.Error("Invalid queue entry position");
    }

    // Update the status of the entry
    await QueueEntryCollection.updateAsync(id, {
      $set: {
        status: "in-progress",
        start: time,
      },
    });
  },
});

// Enqueues a patient to a service queue
export async function enqueue(data: QueueEntryData): Promise<string> {
  return await Meteor.callAsync("queueEntry.enqueue", data);
}

// Dequeues a patient from the service queue
export async function dequeue(
  id: string,
  reason: DequeueReason,
  time: Date,
): Promise<void> {
  await Meteor.callAsync("queueEntry.dequeue", id, reason, time);
}

// Starts a service for a queue entry
export async function startService(id: string, time: Date): Promise<void> {
  await Meteor.callAsync("queueEntry.startService", id, time);
}
