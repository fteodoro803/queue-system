import { Meteor } from "meteor/meteor";
import {
  SERVICE_SHORTCODE_MAX_LENGTH,
  SERVICE_SHORTCODE_MIN_LENGTH,
  ServicesCollection,
} from "/imports/api/service";
import { isValidShortcode } from "/imports/utils/serviceUtils";
import { normaliseString } from "/imports/utils/utils";

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
    const normalisedShortcode = normaliseString(data.shortcode);
    if (!isValidShortcode(normalisedShortcode)) {
      throw new Meteor.Error(
        "validation-error",
        `Shortcode must be between ${SERVICE_SHORTCODE_MIN_LENGTH} and ${SERVICE_SHORTCODE_MAX_LENGTH} characters.`,
      );
    }

    return ServicesCollection.insertAsync({
      name: data.name.trim(),
      shortcode: normalisedShortcode,
      cost: data.cost ?? null,
      duration: data.duration,
      description: data.description.trim(),
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
    if (data.shortcode !== undefined) {
      const normalisedShortcode = normaliseString(data.shortcode);
      if (!isValidShortcode(normalisedShortcode)) {
        throw new Meteor.Error(
          "validation-error",
          `Shortcode must be between ${SERVICE_SHORTCODE_MIN_LENGTH} and ${SERVICE_SHORTCODE_MAX_LENGTH} characters.`,
        );
      }
      updates.shortcode = normalisedShortcode;
    }
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
});

// ---- Exports for the Meteor methods ----

/**
 *
 * @param data - Service data to insert
 * @returns The ID of the newly created service document
 */
export async function insertService(data: ServiceData): Promise<string> {
  return Meteor.callAsync("services.insert", data);
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
  return Meteor.callAsync("services.update", id, data);
}

export async function getService(id: string) {
  return await ServicesCollection.findOneAsync(id);
}
