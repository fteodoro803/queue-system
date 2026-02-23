import { Mongo } from "meteor/mongo";
import { Patient } from "/imports/api/patient";
import { Service } from "./service";
import { Provider } from "./provider";

export interface Appointment {
  _id: string;
  date: Date;
  endDate: Date;
  providerId: string;
  provider: Provider;
  patientId: string;
  patient: Patient;
  serviceId: string;
  service: Service;
  status: string;
  createdAt: Date;
}

export const AppointmentsCollection = new Mongo.Collection<Appointment>(
  "appointments",
);
