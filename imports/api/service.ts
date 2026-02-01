import { Mongo } from "meteor/mongo";

export interface Service {
  _id?: string;
  name: string;
  cost?: number;
  duration: number;   // duration in minutes
  description: string;
}

export const ServicesCollection = new Mongo.Collection<Service>('services');