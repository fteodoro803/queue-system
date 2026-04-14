import { Mongo } from "meteor/mongo";
import { Profile } from "/imports/api/profile";

export interface ProviderService {
  id: string;
  name: string; // for display in DB
  // cost: number;
  enabled: boolean; // Whether the provider currently offers this service
}

export interface Provider extends Profile {
  available: boolean;
  services: ProviderService[]; // Services offered by the provider
}

export const ProviderCollection = new Mongo.Collection<Provider>("providers");
