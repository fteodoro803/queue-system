import {Meteor} from "meteor/meteor";
import {PatientsCollection} from "/imports/api/patient";

Meteor.methods({
  // Adds patient to the database
  "patients.insert"({name, email, number, icon}: {
    name: string;
    email?: string;
    number?: string;
    icon?: string;
  }) {
    return PatientsCollection.insertAsync({
      name: name.trim(),
      email: email?.trim() || null,
      number: number?.trim() || null,
      icon: icon?.trim() || null,
      createdAt: new Date()
    });
  },
  "patients.update"({_id, name, email, number}: { name: string, email?: string, number?: string }) {
    return PatientsCollection.updateAsync(_id, {
      $set: {
        name: name,
        email: email,
        number: number
      }
    })
  },
});
