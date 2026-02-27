import { Mongo } from "meteor/mongo";

export interface Service {
  _id: string;
  name: string;
  cost?: number | null;
  duration: number; // duration in minutes
  description: string;

  // Analytics fields
  count?: number;
  totalDuration?: number; // total duration in minutes
  avgDuration?: number; // average duration in minutes
  createdAt: Date;
}

export const ServicesCollection = new Mongo.Collection<Service>("services");
