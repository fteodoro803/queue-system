import { Mongo } from "meteor/mongo";

export const QUEUE_STATES = [
  "waiting", // waiting but not yet ready to be served (e.g., patient hasn't checked in)
  "ready", // waiting but checked-in and ready to be served
  "in-progress", // TODO: change to ongoing or active later
  "completed",
  "cancelled",
] as const;
export type QueueStatus = (typeof QUEUE_STATES)[number];

export interface QueueEntry {
  _id: string;
  displayId: string; // Unique ID for display purposes (e.g., "AB12")
  patientId: string;
  serviceId: string;
  providerId: string | null; // optional, assigned when provider starts serving the patient

  position: number | null;
  status: QueueStatus;
  initialEstimatedWaitTime: number | null; // in minutes, set when patient is added to queue
  readyAt: Date | null;
  start: Date | null;
  end: Date | null;
  createdAt: Date;
}

export const QueueEntryCollection = new Mongo.Collection<QueueEntry>("queue");
