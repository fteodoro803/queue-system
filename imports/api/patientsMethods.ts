import { Meteor } from "meteor/meteor";
import { PatientsCollection } from "/imports/api/patient";

Meteor.methods({
    // Adds patient to the database
    "patients.insert"({ name, email, number }: { name: string, email?: string, number?: string }) {
        return PatientsCollection.insertAsync({ name, email, number, createdAt: new Date() });
    },
});