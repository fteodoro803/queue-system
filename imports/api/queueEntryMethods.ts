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
  // Adds queue entry to the database
  async "queueEntry.insert"(data: QueueEntryData) {
    return QueueEntryCollection.insertAsync({
      patientId: data.patient._id,
      patient: data.patient,
      serviceId: data.service._id,
      service: data.service,
      position: null, // Position will be calculated on the server
      start: null, // Start time will be set when the patient is called
      end: null, // End time will be set when the patient is called
      createdAt: new Date(),
    });
  },

  // Deletes queue entry from the database
  "queueEntry.remove"(id: string) {
    return QueueEntryCollection.removeAsync(id);
  },
});

export async function insertQueueEntry(data: QueueEntryData) {
  return await Meteor.callAsync("queueEntry.insert", data);
}
