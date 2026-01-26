import {Meteor} from "meteor/meteor";
import {servicesCollection} from "/imports/api/service";
import {isInteger} from "/imports/utils/utils";

Meteor.methods({
  // Adds service type to the database
  "services.insert"({name, duration}: {
    name: string;
    duration: string;
  }) {
    if (!isInteger(duration)) {
      return;
    }

    return servicesCollection.insertAsync({
      name: name,
      duration: duration,
      createdAt: new Date(),
    });
  },
});