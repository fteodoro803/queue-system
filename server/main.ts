import { Meteor } from "meteor/meteor";
import { PatientsCollection } from "/imports/api/patient";
import "/imports/api/patientsMethods";
import { AppointmentsCollection } from "/imports/api/appointment";
import "/imports/api/appointmentMethods";
import { ServicesCollection } from "/imports/api/service";
import "/imports/api/serviceMethods";
import { ProviderCollection } from "/imports/api/provider";
import "/imports/api/providerMethods";
import { QueueEntryCollection } from "/imports/api/queueEntry";
import "/imports/api/queueEntryMethods";
import { CountersCollection } from "/imports/api/counters";
import "/imports/api/countersMethods";
import {
  DEFAULT_FLAGS,
  DEFAULT_SETTINGS,
  SettingsCollection,
} from "/imports/api/settings";
import "/imports/api/settingsMethods";

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

// Publish Patients by IDs
Meteor.publish("patients.byIds", function (patientIds: string[]) {
  if (!patientIds?.length) {
    this.ready(); // No patient IDs provided, marks the subscription as ready without return data
    return;
  }
  return PatientsCollection.find({ _id: { $in: patientIds } });
});

// Publish Queue Entries
Meteor.publish("queue", function () {
  return QueueEntryCollection.find();
});

// Publish Queue Entries by Service ID sorted by position
Meteor.publish("queue.byService", function (serviceId: string) {
  return QueueEntryCollection.find({ serviceId }, { sort: { position: 1 } });
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

  // Initialise flags if they don't exist yet
  if (!(await SettingsCollection.findOneAsync({ _id: "app_flags" }))) {
    await SettingsCollection.insertAsync({
      _id: "app_flags",
      ...DEFAULT_FLAGS,
    });
    console.log("Initialised default flags");
  }

  // Backfill newly added test-date fields on older app_flags documents.
  await SettingsCollection.updateAsync(
    { _id: "app_flags", TEST_DATE_DATE: { $exists: false } },
    { $set: { TEST_DATE_DATE: DEFAULT_FLAGS.TEST_DATE_DATE } },
  );
  await SettingsCollection.updateAsync(
    { _id: "app_flags", TEST_DATE_TIME: { $exists: false } },
    { $set: { TEST_DATE_TIME: DEFAULT_FLAGS.TEST_DATE_TIME } },
  );

  const flags = await SettingsCollection.findOneAsync({ _id: "app_flags" });
  if (flags && "TEST_DATE_DATE" in flags) {
    const testDate = flags.TEST_DATE_DATE;
    if (/^\d{4}-\d{2}-\d{2}$/.test(testDate)) {
      const [year, month, day] = testDate.split("-");
      await SettingsCollection.updateAsync(
        { _id: "app_flags" },
        { $set: { TEST_DATE_DATE: `${day}-${month}-${year}` } },
      );
    }
  }

  console.log("Server started");
});
