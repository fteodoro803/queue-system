import { Mongo } from "meteor/mongo";
import { Patient } from "./patient";
import { Service } from "./service";

export const QUEUE_STATES = [
  "waiting",
  "in-progress",
  "completed",
  "cancelled",
] as const;

export interface QueueEntry {
  _id: string;
  patientId: string;
  patient: Patient;
  serviceId: string;
  service: Service;
  position: number | null;
  status: (typeof QUEUE_STATES)[number];
  start: Date | null;
  end: Date | null;
  createdAt: Date;
}

export const QueueEntryCollection = new Mongo.Collection<QueueEntry>(
  "queueEntry",
);
