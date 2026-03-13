import { Mongo } from "meteor/mongo";
import { Patient } from "/imports/api/patient";
import { Service } from "/imports/api/service";

export const QUEUE_STATES = [
  "waiting",
  "ready",
  "in-progress",
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
  // initialExpectedWaitTime: number | null; // TODO: in minutes, set when patient is added to queue
  // currentExpectedWaitTime?: number | null; // TODO: in minutes, can be updated over time based on queue dynamics
  readyAt: Date | null;
  start: Date | null;
  end: Date | null;
  createdAt: Date;
}

export const QueueEntryCollection = new Mongo.Collection<QueueEntry>("queue");
