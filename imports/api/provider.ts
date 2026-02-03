import { Mongo } from "meteor/mongo";
import { Profile } from "/imports/api/profile";

export interface Provider extends Profile {
  services: string[]; // Array of Service IDs
}

export const ProviderCollection = new Mongo.Collection<Provider>(
  "provider",
);
