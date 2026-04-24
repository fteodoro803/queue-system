import { Mongo } from "meteor/mongo";
import { Profile } from "/imports/api/profile";

export interface ProviderService {
  id: string;
  name: string; // for display in DB
  // cost: number;
  enabled: boolean; // Whether the provider currently offers this service (so appointments can be made)
}

export interface Provider extends Profile {
  available: boolean; // Whether a provider is ready to take in assignments (ex. service a patient)
  active: boolean; // Whether the provider is currently at work and on shift
  services: ProviderService[]; // Services offered by the provider
}

export const ProviderCollection = new Mongo.Collection<Provider>("providers");
