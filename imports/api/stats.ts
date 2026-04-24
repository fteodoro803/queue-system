import { Mongo } from "meteor/mongo";

// Key is serviceId + date (e.g. "service1-2024-06-01")
// all time fields are in minutes
export interface Stats {
  _id: string;
  serviceId: string;
  date: Date;
  count: number; // number of appointments for the service
  totalDuration: number; // service duration
  estimatedWaitTime: number; // given by system when the queue entry is created
  actualWaitTime: number; // calculated when the service is started

  // TODO
  // num_cancellations: number;
  // total_wait_time
}

export const StatsCollection = new Mongo.Collection<Stats>("stats");
