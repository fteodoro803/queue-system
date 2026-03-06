import { Meteor } from "meteor/meteor";
import { QueueEntryCollection } from "./queueEntry";
import { Patient } from "./patient";
import { Service } from "./service";

export interface QueueEntryData {
  patient: Patient; // Replace with actual Patient type
  service: Service; // Replace with actual Service type
}

// Client-Called methods
Meteor.methods({
  // Inserts queue entry to the database
  async "queueEntry.insert"(data: QueueEntryData) {
    // 1. Get the current max position in the queue, for respective service
    const maxPositionEntry = await QueueEntryCollection.findOneAsync(
      { position: { $ne: null }, serviceId: data.service._id },
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
      start: null, // Start time will be set once the service is started
      end: null, // End time will be set after the service is completed
      createdAt: new Date(),
    });
  },

  // Removes queue entry from the database
  "queueEntry.remove"(id: string) {
    return QueueEntryCollection.removeAsync(id);
  },
});

// Enqueues a patient to a service queue
export async function insertQueueEntry(data: QueueEntryData): Promise<string> {
  return await Meteor.callAsync("queueEntry.insert", data);
}
