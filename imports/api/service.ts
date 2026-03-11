import { Mongo } from "meteor/mongo";

export interface Service {
  _id: string;
  name: string;
  shortcode: string;
  cost?: number | null;
  duration: number; // duration in minutes
  description: string;
  priority: number; // Higher number means higher priority

  // Analytics fields
  count?: number | null;
  totalDuration?: number | null; // total duration in minutes
  avgDuration?: number | null; // average duration in minutes
  createdAt: Date;
}

export const ServicesCollection = new Mongo.Collection<Service>("services");
