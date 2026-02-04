import { Meteor } from "meteor/meteor";
import { ProviderCollection, ProviderService } from "./provider";

// Interfaces
export interface providerData {
  name: string;
  email?: string;
  number?: string;
  avatar?: string;
  services?: ProviderService[];
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

  // Add service to provider's list of services
  async "provider.updateService"(providerId: string, service: ProviderService) {
    // 1. Try to update the service
    let result = await ProviderCollection.updateAsync(
      // Match by providerId and serviceId
      {
        _id: providerId,
        "services.id": service.id,
      },
      // Update the matched service
      {
        $set: {
          "services.$": service,
        },
      },
      // Prevent adding new Provider if match not found
      { upsert: false },
    );

    // 2. If no service was updated, add it
    // Service not updating means it doesn't exist yet
    if (result === 0) {
      result = await ProviderCollection.updateAsync(
        { _id: providerId },
        {
          $addToSet: {
            services: service,
          },
        },
      );
    }

    return result;
  },
});

// Exports for the Meteor methods
export async function insertProvider(data: providerData) {
  return Meteor.callAsync("provider.insert", data);
}

export async function updateProvider(id: string, data: providerData) {
  return Meteor.callAsync("provider.update", id, data);
}

export async function updateProviderService(
  id: string,
  service: ProviderService,
) {
  return Meteor.callAsync("provider.updateService", id, service);
}
