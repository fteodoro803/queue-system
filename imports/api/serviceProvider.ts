import { Mongo } from "meteor/mongo";
import { Profile } from "/imports/api/profile";

export interface ServiceProvider extends Profile {}

export const ServiceProviderCollection = new Mongo.Collection<ServiceProvider>(
  "serviceProvider",
);
