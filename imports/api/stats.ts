import { Mongo } from "meteor/mongo";

// Key is serviceId + date (e.g. "service1-2024-06-01")
export interface Stats {
  _id: string;
  serviceId: string;
  date: Date;
  count: number; // number of appointments for that service on that date
  totalDuration: number; // in minutes

  // TODO
  // num_cancellations: number;
  // total_wait_time
}

export const StatsCollection = new Mongo.Collection<Stats>("stats");
