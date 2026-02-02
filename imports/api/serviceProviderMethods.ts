import { Meteor } from "meteor/meteor";
import { ServiceProviderCollection } from "/imports/api/serviceProvider";

// Interfaces
export interface serviceProviderData {
  name: string;
  email?: string;
  number?: string;
  avatar?: string;
}

// Meteor CRUD methods
Meteor.methods({
  // Adds patient to the database
  "serviceProvider.insert"(data: serviceProviderData) {
    return ServiceProviderCollection.insertAsync({
      name: data.name.trim(),
      email: data.email?.trim() || null,
      number: data.number?.trim() || null,
      avatar: data.avatar?.trim() || null,
      createdAt: new Date(),
    });
  },
  "serviceProvider.update"(id: string, data: serviceProviderData) {
    const updates: Partial<serviceProviderData> = {};

    // Only update fields that are provided
    if (data.name !== undefined) updates.name = data.name.trim();
    if (data.email !== undefined) updates.email = data.email?.trim() ?? null;
    if (data.number !== undefined) updates.number = data.number?.trim() ?? null;
    if (data.avatar !== undefined) updates.avatar = data.avatar?.trim() ?? null;

    return ServiceProviderCollection.updateAsync(id, {
      $set: updates,
    });
  },
});

// Exports for the Meteor methods
export async function insertServiceProvider(data: serviceProviderData) {
  return Meteor.callAsync("serviceProvider.insert", data);
}

export async function updateServiceProvider(
  id: string,
  data: serviceProviderData,
) {
  return Meteor.callAsync("serviceProvider.update", id, data);
}
