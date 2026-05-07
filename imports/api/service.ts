import { Mongo } from "meteor/mongo";

export const SERVICE_SHORTCODE_MIN_LENGTH = 1;
export const SERVICE_SHORTCODE_MAX_LENGTH = 5;

export interface Service {
  _id: string;
  name: string;
  shortcode: string; // used for queue numbering
  cost?: number | null;
  duration: number; // duration in minutes
  description: string;
  priority: number; // Higher number means higher priority
  createdAt: Date;
}

export const ServicesCollection = new Mongo.Collection<Service>("services");
