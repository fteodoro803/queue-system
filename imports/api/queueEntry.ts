import { Mongo } from "meteor/mongo";
import { Patient } from "/imports/api/patient";
import { Service } from "/imports/api/service";

export const QUEUE_STATES = [
  "waiting", // waiting but not yet ready to be served (e.g., patient hasn't checked in)
  "ready", // waiting but checked-in and ready to be served
  "in-progress", // TODO: change to ongoing or active later
  "completed",
  "cancelled",
] as const;

export interface QueueEntry {
  _id: string;
  displayId: string; // Unique ID for display purposes (e.g., "AB12")
  patientId: string;
  patient: Patient;
  serviceId: string;
  service: Service;
  position: number | null;
  status: (typeof QUEUE_STATES)[number];
  initialEstimatedWaitTime: number | null; // in minutes, set when patient is added to queue
  readyAt: Date | null;
  start: Date | null;
  end: Date | null;
  createdAt: Date;
}

export const QueueEntryCollection = new Mongo.Collection<QueueEntry>("queue");
