import { Meteor } from "meteor/meteor";
import { ProviderCollection, ProviderService } from "/imports/api/provider";

// ---- Interfaces ----
export interface ProviderData {
  name: string;
  email?: string;
  number?: string;
  avatar?: string;
  available?: boolean;
  services?: ProviderService[];
}

// ---- Meteor CRUD methods ----
Meteor.methods({
  // Adds provider to the database
  // Returns the new provider's ID
  "provider.insert"(data: ProviderData): Promise<string> {
    return ProviderCollection.insertAsync({
      name: data.name.trim(),
      email: data.email?.trim() ?? null,
      number: data.number?.trim() ?? null,
      avatar: data.avatar?.trim() ?? null,
      services: data.services ?? [],
      available: false, // Default to unavailable
      createdAt: new Date(),
    });
  },

  // Updates provider information
  // Returns number of documents updated (should be 1 if successful)
  async "provider.update"(
    id: string,
    data: Partial<ProviderData>,
  ): Promise<number> {
    const updates: Partial<ProviderData> = {};

    // Only update fields that are provided
    if (data.name !== undefined) updates.name = data.name.trim();
    if (data.email !== undefined) updates.email = data.email?.trim() ?? null;
    if (data.number !== undefined) updates.number = data.number?.trim() ?? null;
    if (data.avatar !== undefined) updates.avatar = data.avatar?.trim() ?? null;
    if (data.available !== undefined) updates.available = data.available;
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

  // Updates availability of a Provider
  async "provider.toggleAvailability"(id: string): Promise<number> {
    // 1. Get the current availability
    const provider = await ProviderCollection.findOneAsync(id);
    if (!provider) {
      throw new Meteor.Error(
        "not-found",
        `Provider with id ${id} does not exist`,
      );
    }
    const currentAvailability = provider.available;

    // 2. Flip the availability status
    return await ProviderCollection.updateAsync(id, {
      $set: { available: !currentAvailability },
    });
  },

  // Add service to provider's list of services
  // If the service already exists (matched by id), it will be updated instead
  // Returns number of documents updated (should be 1 if successful)
  async "provider.updateService"(
    providerId: string,
    service: ProviderService,
  ): Promise<number> {
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

// ---- Exports for the Meteor methods ----
/**
 *
 * @param data - Provider data to insert
 * @returns The ID of the newly created provider document
 */
export async function insertProvider(data: ProviderData): Promise<string> {
  return Meteor.callAsync("provider.insert", data);
}

/**
 * @param id - The ID of the provider to update
 * @param data - Partial provider data with fields to update
 * @returns The number of documents updated (should be 1 if successful)
 * @throws Meteor.Error with error code "not-found" if the provider ID does not exist
 */
export async function updateProvider(
  id: string,
  data: Partial<ProviderData>,
): Promise<number> {
  return Meteor.callAsync("provider.update", id, data);
}

/**
 * @param id - The ID of the provider
 * @param service - The service data to update or add
 * @returns The number of documents updated (should be 1 if successful)
 */
export async function updateProviderService(
  id: string,
  service: ProviderService,
): Promise<number> {
  return Meteor.callAsync("provider.updateService", id, service);
}

/**
 * Toggles the availability status of a provider
 * @param id - The ID of the provider
 * @returns The number of documents updated (should be 1 if successful)
 */
export async function toggleProviderAvailability(id: string): Promise<number> {
  return Meteor.callAsync("provider.toggleAvailability", id);
}

export async function setProviderAvailability(
  id: string,
  available: boolean,
): Promise<number> {
  return await updateProvider(id, { available });
}

export async function selectProvider(
  serviceId: string,
): Promise<string | undefined> {
  const collection = ProviderCollection.rawCollection();
  const docs = await collection
    .aggregate([
      // 1. Match providers that are available and offer the specified service
      {
        $match: {
          available: true,
          services: {
            $elemMatch: {
              id: serviceId,
              enabled: true,
            },
          },
        },
      },

      // 2. Randomly select one provider
      { $sample: { size: 1 } },
    ])
    .toArray();

  if (docs.length === 0) {
    return undefined; // No available providers for the service
  }

  const providerId = docs[0]._id.toString();
  return providerId;
}
