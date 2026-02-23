import { Meteor } from "meteor/meteor";
import { AppointmentsCollection } from "/imports/api/appointment";
import { Service } from "./service";
import { Patient } from "./patient";
import { Provider } from "./provider";

export const APPOINTMENT_STATES = [
  "scheduled",
  "in-progress",
  "completed",
  "cancelled",
] as const;

export interface AppointmentData {
  service: Service;
  provider: Provider;
  patient: Patient;
  date: Date;
  status: (typeof APPOINTMENT_STATES)[number];
}

Meteor.methods({
  // Adds appointment to the database
  "appointments.insert"(data: AppointmentData) {
    return AppointmentsCollection.insertAsync({
      service: data.service,
      provider: data.provider,
      patient: data.patient,
      date: data.date,
      endDate: new Date(data.date.getTime() + data.service.duration * 60000), // calculate end date based on service duration
      status: data.status,
      createdAt: new Date(),
    });
  },

  // Deletes appointment from the database
  "appointments.remove"(id: string) {
    return AppointmentsCollection.removeAsync(id);
  },

  // Marks appointment as complete
  "appointments.complete"(id: string) {
    return AppointmentsCollection.updateAsync(id, {
      $set: { status: "completed" },
    });
  },

  // Marks appointment as in-progress
  "appointments.start"(id: string) {
    return AppointmentsCollection.updateAsync(id, {
      $set: { status: "in-progress" },
    });
  },

  // Marks appointment as cancelled
  "appointments.cancel"(id: string) {
    return AppointmentsCollection.updateAsync(id, {
      $set: { status: "cancelled" },
    });
  },

  // Marks appointment as scheduled
  "appointments.scheduled"(id: string) {
    return AppointmentsCollection.updateAsync(id, {
      $set: { status: "scheduled" },
    });
  },
});

// Exports for the Meteor methods
export async function insertAppointment(data: AppointmentData) {
  return Meteor.callAsync("appointments.insert", data);
}

export async function removeAppointment(id: string) {
  return Meteor.callAsync("appointments.remove", id);
}

export async function markAsCompleted(id: string) {
  return Meteor.callAsync("appointments.complete", id);
}

export async function markAsStarted(id: string) {
  return Meteor.callAsync("appointments.start", id);
}

export async function markAsCancelled(id: string) {
  return Meteor.callAsync("appointments.cancel", id);
}

export async function markAsScheduled(id: string) {
  return Meteor.callAsync("appointments.scheduled", id);
}
