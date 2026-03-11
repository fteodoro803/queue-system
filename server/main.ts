import { Meteor } from "meteor/meteor";
import { PatientsCollection } from "/imports/api/patient";
import "../imports/api/patientsMethods";
import { AppointmentsCollection } from "/imports/api/appointment";
import "../imports/api/appointmentMethods";
import { ServicesCollection } from "/imports/api/service";
import "../imports/api/serviceMethods";
import { ProviderCollection } from "../imports/api/provider";
import "../imports/api/providerMethods";
import { QueueEntryCollection } from "/imports/api/queueEntry";
import "../imports/api/queueEntryMethods";
import { CountersCollection } from "../imports/api/counters";
import "../imports/api/countersMethods";
import { DEFAULT_SETTINGS, SettingsCollection } from "/imports/api/settings";
import "../imports/api/settingsMethods";

// TODO: Add userId field to appointments and filter by it in publications and useFind hooks, so that patients only see their own appointments and providers only see appointments assigned to them. For now, we will just return all appointments for simplicity.
// Meteor.user()?.type === "patient"

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

// Publish Queue Entries
Meteor.publish("queue", function () {
  return QueueEntryCollection.find();
});

// Publish Counters
Meteor.publish("counters", function () {
  return CountersCollection.find();
});

// Publish Settings
Meteor.publish("settings", function () {
  return SettingsCollection.find();
});

Meteor.startup(async () => {
  // Initialise settings if they don't exist yet
  if (!(await SettingsCollection.findOneAsync({ _id: "app_settings" }))) {
    await SettingsCollection.insertAsync({
      _id: "app_settings",
      ...DEFAULT_SETTINGS,
    });
    console.log("Initialised default settings");
  }

  console.log("Server started");
});
