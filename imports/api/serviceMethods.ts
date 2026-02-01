import { Meteor } from "meteor/meteor";
import { ServicesCollection } from "/imports/api/service";
import { isInteger } from "/imports/utils/utils";

Meteor.methods({
  // Adds service type to the database
  "services.insert"({
    name,
    cost,
    duration,
    description,
  }: {
    name: string;
    cost?: number | null;
    duration: number;
    description: string;
  }) {
    return ServicesCollection.insertAsync({
      name: name,
      cost: cost ?? null,
      duration: duration,
      description: description,
      createdAt: new Date(),
    });
  },
});
