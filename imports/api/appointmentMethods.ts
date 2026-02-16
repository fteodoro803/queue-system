import { Meteor } from "meteor/meteor";
import { AppointmentsCollection } from "/imports/api/appointment";
import { Service } from "./service";
import { Patient } from "./patient";
import { Provider } from "./provider";

export const APPOINTMENT_STATES = [
  "scheduled",
  "ongoing",
  "completed",
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
      status: data.status,
      createdAt: new Date(),
    });
  },

  // Deletes appointment from the database
  "appointments.remove"(id: string) {
    return AppointmentsCollection.removeAsync(id);
  },
});

// Exports for the Meteor methods
export async function insertAppointment(data: AppointmentData) {
  return Meteor.callAsync("appointments.insert", data);
}

export async function removeAppointment(id: string) {
  return Meteor.callAsync("appointments.remove", id);
}
