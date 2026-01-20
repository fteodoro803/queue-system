import { Mongo } from "meteor/mongo"
import { Patient } from "/imports/api/patient";

export interface Appointment {
    _id?: string;
    type: string;   // todo: change to appointmentTyp
    time?: Date;
    patient?: Patient;
    createdAt: Date;
}

export const AppointmentsCollection = new Mongo.Collection<Appointment>('appointments');