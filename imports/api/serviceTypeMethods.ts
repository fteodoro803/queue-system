import {Meteor} from "meteor/meteor";
import {serviceTypesCollection} from "/imports/api/serviceType";
import {isInteger} from "/imports/utils/utils";

Meteor.methods({
  // Adds service type to the database
  "serviceTypes.insert"({name, duration}: {
    name: string;
    duration: string;
  }) {
    if (!isInteger(duration)) {
      return;
    }

    return serviceTypesCollection.insertAsync({
      name: name,
      duration: duration,
      createdAt: new Date(),
    });
  },
});