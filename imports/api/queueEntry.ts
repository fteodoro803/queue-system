import { Mongo } from "meteor/mongo";
import { Patient } from "./patient";
import { Service } from "./service";

export interface QueueEntry {
  _id: string;
  patientId: string;
  patient: Patient;
  serviceId: string;
  service: Service;
  position?: number;
  start?: Date;
  end?: Date;
  createdAt: Date;
}

export const QueueEntryCollection = new Mongo.Collection<QueueEntry>(
  "queueEntry",
);
