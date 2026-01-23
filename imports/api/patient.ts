import { Mongo } from "meteor/mongo";

export interface Patient {
    _id?: string;
    name: string;
    email?: string;
    number?: string;

    icon?: string;
    createdAt: Date;
}

export const PatientsCollection = new Mongo.Collection<Patient>('patients');