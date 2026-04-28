import { Mongo } from "meteor/mongo";

export type StatsGranularity = "hourly" | "daily" | "monthly";

// Key is serviceId + date (e.g. "service1-2024-06-01")
// all time fields are in minutes
export interface Stats {
  _id: string;
  serviceId: string;
  date: Date; // the start time of the entry
  granularity: StatsGranularity;
  numCompletedAppointments: number;
  totalDuration: number; // service duration
  estimatedWaitTime: number; // given by system when the queue entry is created
  actualWaitTime: number; // calculated when the service is started
  numCancellations: number;
}

export interface StatsData {
  serviceId: string;
  date: Date;
  inc?: {
    numCompletedAppointments?: number;
    startTime?: Date;
    endTime?: Date;
    estimatedWaitTime?: number;
    actualWaitTime?: number;
    numCancellations?: number;
  };
}

export const StatsCollection = new Mongo.Collection<Stats>("stats");
