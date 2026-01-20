import { Meteor } from 'meteor/meteor';
import {PatientsCollection} from "/imports/api/patient";
import "../imports/api/patientsMethods";
import {AppointmentsCollection} from "/imports/api/appointment";
import "../imports/api/appointmentMethods";

// Publish Patients
Meteor.publish("patients", function () {
  return PatientsCollection.find();
});

// Publish Appointments
Meteor.publish("appointments", function () {
  return AppointmentsCollection.find();
});

Meteor.startup(async () => {
  console.log('Server started');
});
