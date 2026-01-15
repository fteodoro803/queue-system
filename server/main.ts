import { Meteor } from 'meteor/meteor';
import {PatientsCollection} from "/imports/api/patient";

async function insertPatient({ name }) {
  await PatientsCollection.insertAsync({ name, createdAt: new Date() });
}

Meteor.startup(async () => {
  if (await PatientsCollection.find().countAsync() === 0) {
    await insertPatient({
      name: "Biff",
    });
  }

  // We publish the entire Links collection to all clients.
  // In order to be fetched in real-time to the clients
  Meteor.publish("patients", function () {
    return PatientsCollection.find();
  });
});
