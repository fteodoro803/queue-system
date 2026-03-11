import { Meteor } from "meteor/meteor";
import { ServicesCollection } from "/imports/api/service";

export interface ServiceData {
  name: string;
  shortcode: string;
  cost?: number | null;
  duration: number;
  description: string;
}

Meteor.methods({
  // Adds service type to the database
  "services.insert"(data: ServiceData) {
    return ServicesCollection.insertAsync({
      name: data.name,
      shortcode: data.shortcode,
      cost: data.cost ?? null,
      duration: data.duration,
      description: data.description,
      createdAt: new Date(),
    });
  },

  // Clear analytics data for all services
  "services.clearAnalytics"() {
    return ServicesCollection.updateAsync(
      {},
      { $set: { count: 0, totalDuration: null, avgDuration: null } },
      { multi: true },
    );
  },
});

export async function insertService(data: ServiceData) {
  return await Meteor.callAsync("services.insert", data);
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
