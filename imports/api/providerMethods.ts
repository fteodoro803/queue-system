import { Meteor } from "meteor/meteor";
import { ProviderCollection, ProviderService } from "/imports/api/provider";

// Interfaces
export interface ProviderData {
  name: string;
  email?: string;
  number?: string;
  avatar?: string;
  services?: ProviderService[];
}

// Meteor CRUD methods
Meteor.methods({
  // Adds provider to the database
  "provider.insert"(data: ProviderData) {
    return ProviderCollection.insertAsync({
      name: data.name.trim(),
      email: data.email?.trim() ?? null,
      number: data.number?.trim() ?? null,
      avatar: data.avatar?.trim() ?? null,
      services: data.services ?? [],
      createdAt: new Date(),
    });
  },

  // Updates provider information
  async "provider.update"(id: string, data: Partial<ProviderData>) {
    const updates: Partial<ProviderData> = {};

    // Only update fields that are provided
    if (data.name !== undefined) updates.name = data.name.trim();
    if (data.email !== undefined) updates.email = data.email?.trim() ?? null;
    if (data.number !== undefined) updates.number = data.number?.trim() ?? null;
    if (data.avatar !== undefined) updates.avatar = data.avatar?.trim() ?? null;
    if (data.services !== undefined) updates.services = data.services;

    // Update the provider document with the specified fields
    const result = await ProviderCollection.updateAsync(id, {
      $set: updates,
    });

    // Check if the update was successful
    if (result === 0) {
      throw new Meteor.Error(
        "not-found",
        `Provider with id ${id} does not exist`,
      );
    }

    return result;
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
export async function insertProvider(data: ProviderData) {
  return Meteor.callAsync("provider.insert", data);
}

export async function updateProvider(id: string, data: Partial<ProviderData>) {
  return Meteor.callAsync("provider.update", id, data);
}

export async function updateProviderService(
  id: string,
  service: ProviderService,
) {
  return Meteor.callAsync("provider.updateService", id, service);
}
