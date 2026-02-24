import { Meteor } from "meteor/meteor";
import { AppointmentsCollection } from "/imports/api/appointment";
import { Service, ServicesCollection } from "./service";
import { Patient } from "./patient";
import { Provider } from "./provider";
import { findEarliestSlot } from "../utils/appointmentUtils";

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

// Client-Called methods
Meteor.methods({
  // Adds appointment to the database
  "appointments.insert"(data: AppointmentData) {
    return AppointmentsCollection.insertAsync({
      serviceId: data.service._id,
      service: data.service,
      providerId: data.provider._id,
      provider: data.provider,
      patientId: data.patient._id,
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

  // Get earliest appointment time for a given service, and optionally a provider
  // TODO: do proper tests on this. I know this works within a day, but need to verify it works across days, and with edge cases (e.g. appointments that end at closing time)
  // TODO: should i change the arguments to just types Service and Provider?
  async "appointments.getEarliest"(
    serviceId: string,
    providerId: string,
  ): Promise<Date | undefined> {
    const service = await ServicesCollection.findOneAsync(serviceId);
    if (!service) return undefined;
    return findEarliestSlot(service, providerId);
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

export async function getEarliestAppointment(
  serviceId: string,
  providerId: string,
): Promise<Date | undefined> {
  return Meteor.callAsync("appointments.getEarliest", serviceId, providerId);
}
