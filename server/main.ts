import { Meteor } from 'meteor/meteor';
import {PatientsCollection} from "/imports/api/patient";
import "../imports/api/patientsMethods";
import {AppointmentsCollection} from "/imports/api/appointment";
import "../imports/api/appointmentMethods";
import {serviceTypesCollection} from "/imports/api/serviceType";
import "../imports/api/serviceTypeMethods";

// Publish Appointment Types
Meteor.publish("serviceTypes", function () {
  return serviceTypesCollection.find();
});

// Publish Appointments
Meteor.publish("appointments", function () {
  return AppointmentsCollection.find();
});

// Publish Patients
Meteor.publish("patients", function () {
  return PatientsCollection.find();
});

Meteor.startup(async () => {
  console.log('Server started');
});
