import { Meteor } from "meteor/meteor";
import { ProviderCollection } from "./provider";

// Interfaces
export interface providerData {
  name: string;
  email?: string;
  number?: string;
  avatar?: string;
  services?: string[];
}

// Meteor CRUD methods
Meteor.methods({
  // Adds patient to the database
  "provider.insert"(data: providerData) {
    return ProviderCollection.insertAsync({
      name: data.name.trim(),
      email: data.email?.trim() ?? null,
      number: data.number?.trim() ?? null,
      avatar: data.avatar?.trim() ?? null,
      services: data.services ?? [],
      createdAt: new Date(),
    });
  },
  "provider.update"(id: string, data: providerData) {
    const updates: Partial<providerData> = {};

    // Only update fields that are provided
    if (data.name !== undefined) updates.name = data.name.trim();
    if (data.email !== undefined) updates.email = data.email?.trim() ?? null;
    if (data.number !== undefined) updates.number = data.number?.trim() ?? null;
    if (data.avatar !== undefined) updates.avatar = data.avatar?.trim() ?? null;
    if (data.services !== undefined) updates.services = data.services;

    return ProviderCollection.updateAsync(id, {
      $set: updates,
    });
  },
});

// Exports for the Meteor methods
export async function insertProvider(data: providerData) {
  return Meteor.callAsync("provider.insert", data);
}

export async function updateProvider(id: string, data: providerData) {
  return Meteor.callAsync("provider.update", id, data);
}
