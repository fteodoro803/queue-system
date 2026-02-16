import { Mongo } from "meteor/mongo";
import { Patient } from "/imports/api/patient";
import { Service } from "./service";
import { Provider } from "./provider";

export interface Appointment {
  _id?: string;
  date: Date;
  provider: Provider;
  patient: Patient;
  service: Service;
  state: string;
  createdAt: Date;
}

export const AppointmentsCollection = new Mongo.Collection<Appointment>(
  "appointments",
);
