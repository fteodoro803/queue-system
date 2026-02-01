import { Meteor } from "meteor/meteor";
import { PatientsCollection } from "/imports/api/patient";

// Interfaces for method parameters
export interface PatientData {
  name: string;
  email?: string;
  number?: string;
  avatar?: string;
}

// Meteor CRUD methods for Patients
Meteor.methods({
  // Adds patient to the database
  "patients.insert"(data: PatientData) {
    return PatientsCollection.insertAsync({
      name: data.name.trim(),
      email: data.email?.trim() ?? null,
      number: data.number?.trim() ?? null,
      avatar: data.avatar?.trim() ?? null,
      createdAt: new Date(),
    });
  },

  // Updates patient information
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
        email: email?.trim() ?? null,
        number: number?.trim() ?? null,
        avatar: avatar?.trim() ?? null,
      },
    });
  },
});

// Exports for the Meteor methods
export async function insertPatient(data: PatientData) {
  return Meteor.callAsync("patients.insert", data);
}
