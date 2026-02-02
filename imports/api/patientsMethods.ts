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
  "patients.update"(id: string, data: PatientData) {
    const updates: Partial<PatientData> = {};

    // Only update fields that are provided
    if (data.name !== undefined) updates.name = data.name.trim();
    if (data.email !== undefined) updates.email = data.email?.trim() ?? null;
    if (data.number !== undefined) updates.number = data.number?.trim() ?? null;
    if (data.avatar !== undefined) updates.avatar = data.avatar?.trim() ?? null;

    return PatientsCollection.updateAsync(id, {
      $set: updates,
    });
  },
});

// Exports for the Meteor methods
export async function insertPatient(data: PatientData) {
  return Meteor.callAsync("patients.insert", data);
}

export async function updatePatient(id: string, data: PatientData) {
  return Meteor.callAsync("patients.update", id, data);
}
