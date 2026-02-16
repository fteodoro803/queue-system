import { Meteor } from "meteor/meteor";
import { AppointmentsCollection } from "/imports/api/appointment";
import { Service } from "./service";
import { Patient } from "./patient";
import { Provider } from "./provider";

export interface AppointmentData {
  service: Service;
  provider: Provider;
  patient: Patient;
  date: Date;
  state: "scheduled" | "waiting" | "ongoing" | "completed";
}

Meteor.methods({
  // Adds appointment to the database
  "appointments.insert"(data: AppointmentData) {
    return AppointmentsCollection.insertAsync({
      service: data.service,
      provider: data.provider,
      patient: data.patient,
      date: data.date,
      state: data.state,
      createdAt: new Date(),
    });
  },
});

// Exports for the Meteor methods
export async function insertAppointment(data: AppointmentData) {
  return Meteor.callAsync("appointments.insert", data);
}
