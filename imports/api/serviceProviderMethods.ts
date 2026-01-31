import { Meteor } from "meteor/meteor";
import { ServiceProviderCollection } from "/imports/api/serviceProvider";

Meteor.methods({
  // Adds patient to the database
  "serviceProvider.insert"({name, email, number, avatar}: {
    name: string;
    email?: string;
    number?: string;
    avatar?: string;
  }) {
    return ServiceProviderCollection.insertAsync({
      name: name.trim(),
      email: email?.trim() || null,
      number: number?.trim() || null,
      avatar: avatar?.trim() || null,
      createdAt: new Date()
    });
  },
  "serviceProvider.update"({_id, name, email, number, avatar}: {
    name: string,
    email?: string,
    number?: string,
    avatar?: string,
  }) {
    return ServiceProviderCollection.updateAsync(_id, {
      $set: {
        name: name.trim(),
        email: email?.trim() || null,
        number: number?.trim() || null,
        avatar: avatar?.trim() || null,
      }
    });
  },
});
