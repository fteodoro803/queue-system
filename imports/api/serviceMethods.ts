import { Meteor } from "meteor/meteor";
import { ServicesCollection } from "/imports/api/service";
import { isInteger } from "/imports/utils/utils";

Meteor.methods({
  // Adds service type to the database
  "services.insert"({name, cost, duration, description}: {
    name: string;
    cost?: string;
    duration: string;
    description: string;
  }) {

    // If cost exists, check if it's an Integer
    if (cost && !isInteger(cost)) {
      return;
    }

    // Check if duration is an Integer
    if (!isInteger(duration)) {
      return;
    }

    return ServicesCollection.insertAsync({
      name: name,
      cost: cost ?? null,
      duration: duration,
      description: description,
      createdAt: new Date(),
    });
  },
});