import { Mongo } from "meteor/mongo";

export type StatsGranularity = "hourly" | "daily" | "monthly";

// Fields that are metadata (never incremented directly)
type StatsMetaFields =
  | "_id"
  | "serviceId"
  | "date"
  | "granularity"
  | "totalDuration";

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

// Derived automatically from Stats — add a field to Stats, it appears here too
export type StatsIncrementFields = Partial<Omit<Stats, StatsMetaFields>>;

export interface StatsData {
  serviceId: string;
  date: Date;
  inc?: StatsIncrementFields & {
    // These are used to compute totalDuration, not stored directly in Stats
    startTime?: Date;
    endTime?: Date;
  };
}

export const StatsCollection = new Mongo.Collection<Stats>("stats");
