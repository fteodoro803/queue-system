import { Meteor } from "meteor/meteor";
import { PatientsCollection } from "/imports/api/patient";
import "../imports/api/patientsMethods";
import { AppointmentsCollection } from "/imports/api/appointment";
import "../imports/api/appointmentMethods";
import { ServicesCollection } from "/imports/api/service";
import "../imports/api/serviceMethods";
import { ProviderCollection } from "../imports/api/provider";
import "../imports/api/providerMethods";

// Publish Services
Meteor.publish("services", function () {
  return ServicesCollection.find();
});

// Publish Service Providers
Meteor.publish("providers", function () {
  return ProviderCollection.find();
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
  console.log("Server started");
});
