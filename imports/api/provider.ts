import { Mongo } from "meteor/mongo";
import { Profile } from "/imports/api/profile";

export interface ProviderService {
  id: string;
  name: string; // for display
  // cost: number;
  enabled: boolean;
}

export interface Provider extends Profile {
  services: ProviderService[]; // Services offered by the provider
}

export const ProviderCollection = new Mongo.Collection<Provider>("providers");
