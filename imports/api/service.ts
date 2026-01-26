import { Mongo } from "meteor/mongo"

export interface Service {
  _id?: string;
  name: string;
  duration: number;   // duration in minutes
}

export const servicesCollection = new Mongo.Collection<Service>('services');