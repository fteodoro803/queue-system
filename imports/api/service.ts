import { Mongo } from "meteor/mongo";

export interface Service {
  _id: string;
  name: string;
  cost?: number | null;
  duration: number; // duration in minutes
  description: string;
  createdAt: Date;
}

export const ServicesCollection = new Mongo.Collection<Service>("services");
