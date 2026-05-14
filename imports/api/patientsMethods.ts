import { Meteor } from "meteor/meteor";
import { PatientsCollection } from "/imports/api/patient";
import { normaliseNumber } from "/imports/utils/numberUtils";

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
  // Returns the new patient's ID
  "patients.insert"(data: PatientData): Promise<string> {
    return PatientsCollection.insertAsync({
      name: data.name.trim(),
      email: data.email?.trim() ?? null,
      number: data.number ? normaliseNumber(data.number) : null,
      avatar: data.avatar?.trim() ?? null,
      createdAt: new Date(),
    });
  },

  // Updates patient information
  // Returns number of documents updated (should be 1 if successful)
  async "patients.update"(
    id: string,
    data: Partial<PatientData>,
  ): Promise<number> {
    const updates: Partial<PatientData> = {};

    // Only update fields that are provided
    if (data.name !== undefined) updates.name = data.name.trim();
    if (data.email !== undefined) updates.email = data.email.trim();
    if (data.number !== undefined)
      updates.number = normaliseNumber(data.number);
    if (data.avatar !== undefined) updates.avatar = data.avatar.trim();

    const result = await PatientsCollection.updateAsync(id, {
      $set: updates,
    });

    if (result === 0) {
      throw new Meteor.Error(
        "not-found",
        `Patient with id ${id} does not exist`,
      );
    }

    return result;
  },
});

// Exports for the Meteor methods
export async function insertPatient(data: PatientData): Promise<string> {
  return Meteor.callAsync("patients.insert", data);
}

export async function updatePatient(
  id: string,
  data: Partial<PatientData>,
): Promise<number> {
  return Meteor.callAsync("patients.update", id, data);
}

export async function getPatient(id: string) {
  return PatientsCollection.findOneAsync(id);
}
