import { Meteor } from "meteor/meteor";
import { ServicesCollection } from "/imports/api/service";

// ---- Interfaces ----
export interface ServiceData {
  name: string;
  shortcode: string;
  cost?: number | null;
  duration: number;
  description: string;
  priority: number; //
}

// ---- Meteor CRUD methods ----
Meteor.methods({
  // Adds service type to the database
  // Returns the ID of the newly created service document
  "services.insert"(data: ServiceData): Promise<string> {
    return ServicesCollection.insertAsync({
      name: data.name,
      shortcode: data.shortcode,
      cost: data.cost ?? null,
      duration: data.duration,
      description: data.description,
      priority: data.priority ?? 1, // default priority
      createdAt: new Date(),
    });
  },

  // Updates service information
  // Returns the number of documents updated (should be 1 if successful)
  async "services.update"(
    id: string,
    data: Partial<ServiceData>,
  ): Promise<number> {
    const updates: Partial<ServiceData> = {};

    if (data.name !== undefined) updates.name = data.name.trim();
    if (data.shortcode !== undefined) updates.shortcode = data.shortcode.trim();
    if (data.description !== undefined)
      updates.description = data.description.trim();
    if (data.duration !== undefined) updates.duration = data.duration;
    if (data.priority !== undefined) updates.priority = data.priority;
    if (data.cost !== undefined) updates.cost = data.cost;

    const result = await ServicesCollection.updateAsync(id, {
      $set: updates,
    });

    if (result === 0) {
      throw new Meteor.Error(
        "not-found",
        `Service with id ${id} does not exist`,
      );
    }

    return result;
  },

  // Clear analytics data for all services
  async "services.clearAnalytics"() {
    return await ServicesCollection.updateAsync(
      {},
      { $set: { count: 0, totalDuration: null, avgDuration: null } },
      { multi: true },
    );
  },

  // TODO: Calculate performance across all services
  // "services.calculatePerformance"() {
  // }
});

// ---- Exports for the Meteor methods ----

/**
 *
 * @param data - Service data to insert
 * @returns The ID of the newly created service document
 */
export async function insertService(data: ServiceData): Promise<string> {
  return await Meteor.callAsync("services.insert", data);
}

/**
 * @param id - The ID of the service to update
 * @param data - Partial service data with fields to update
 * @returns The number of documents updated (should be 1 if successful)
 * @throws Meteor.Error with error code "not-found" if the service ID does not exist
 */
export async function updateService(
  id: string,
  data: Partial<ServiceData>,
): Promise<number> {
  return await Meteor.callAsync("services.update", id, data);
}

export async function updateServiceAnalytics(
  serviceId: string,
  duration: number,
) {
  const service = await ServicesCollection.findOneAsync(serviceId);
  if (!service) return;

  const newTotal = (service.totalDuration ?? 0) + duration;
  const newCount = (service.count ?? 0) + 1;
  const newAverage = newTotal / newCount;

  await ServicesCollection.updateAsync(serviceId, {
    // $inc: { count: 1, totalDuration: duration },
    // $set: { avgDuration: newAverage },

    $set: { count: newCount, totalDuration: newTotal, avgDuration: newAverage },
  });
}

export async function clearServiceAnalytics() {
  return await Meteor.callAsync("services.clearAnalytics");
}

export async function getService(id: string) {
  return await ServicesCollection.findOneAsync(id);
}
