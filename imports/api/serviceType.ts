import { Mongo } from "meteor/mongo"

export interface ServiceType {
  _id?: string;
  name: string;
  duration: number;   // duration in minutes
}

export const serviceTypesCollection = new Mongo.Collection<ServiceType>('serviceTypes');