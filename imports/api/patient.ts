import { Mongo } from "meteor/mongo";
import { Profile } from "/imports/api/profile";

export interface Patient extends Profile {}

export const PatientsCollection = new Mongo.Collection<Patient>("patients");
