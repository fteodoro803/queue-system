import { Meteor } from "meteor/meteor";
import { ServicesCollection } from "/imports/api/service";

export interface ServiceData {
  name: string;
  cost?: number | null;
  duration: number;
  description: string;
}

Meteor.methods({
  // Adds service type to the database
  "services.insert"(data: ServiceData) {
    return ServicesCollection.insertAsync({
      name: data.name,
      cost: data.cost ?? null,
      duration: data.duration,
      description: data.description,
      createdAt: new Date(),
    });
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
    $inc: { count: 1, totalDuration: duration },
    $set: { avgDuration: newAverage },
  });
}
