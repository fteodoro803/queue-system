import { Meteor } from "meteor/meteor";
import { PatientsCollection } from "/imports/api/patient";

Meteor.methods({
  // Adds patient to the database
  "patients.insert"({
    name,
    email,
    number,
    avatar,
  }: {
    name: string;
    email?: string;
    number?: string;
    avatar?: string;
  }) {
    return PatientsCollection.insertAsync({
      name: name.trim(),
      email: email?.trim() || null,
      number: number?.trim() || null,
      avatar: avatar?.trim() || null,
      createdAt: new Date(),
    });
  },
  "patients.update"({
    _id,
    name,
    email,
    number,
    avatar,
  }: {
    _id: string;
    name: string;
    email?: string;
    number?: string;
    avatar?: string;
  }) {
    return PatientsCollection.updateAsync(_id, {
      $set: {
        name: name.trim(),
        email: email?.trim() || null,
        number: number?.trim() || null,
        avatar: avatar?.trim() || null,
      },
    });
  },
});
