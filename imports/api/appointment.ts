import { Mongo } from "meteor/mongo";
import { Patient } from "/imports/api/patient";
import { Service } from "./service";
import { Provider } from "./provider";

export interface Appointment {
  _id: string;
  providerId: string;
  provider: Provider;
  patientId: string;
  patient: Patient;
  serviceId: string;
  service: Service;
  scheduled_start: Date;
  scheduled_end: Date;
  real_start?: Date;
  real_end?: Date;
  status: string;
  createdAt: Date;
}

export const AppointmentsCollection = new Mongo.Collection<Appointment>(
  "appointments",
);
