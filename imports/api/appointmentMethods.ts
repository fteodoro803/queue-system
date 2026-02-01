import { Meteor } from "meteor/meteor";
import { AppointmentsCollection } from "/imports/api/appointment";

Meteor.methods({
  // Adds appointment to the database
  "appointments.insert"({ type }: { type: string }) {
    return AppointmentsCollection.insertAsync({ type, createdAt: new Date() });
  },
});
