import { Meteor } from 'meteor/meteor';
import {PatientsCollection} from "/imports/api/patient";
import "../imports/api/patientsMethods";

// Publish Patients
Meteor.publish("patients", function () {
  return PatientsCollection.find();
});

Meteor.startup(async () => {
  console.log('Server started');
});
