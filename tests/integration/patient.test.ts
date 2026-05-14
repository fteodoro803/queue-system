import { assert } from "chai";
import { Meteor } from "meteor/meteor";
import { PatientsCollection } from "/imports/api/patient";
import { insertPatient, updatePatient } from "/imports/api/patientsMethods";

if (Meteor.isServer) {
  describe("[INTEGRATION] patientMethods", function () {
    beforeEach(async () => {
      await PatientsCollection.removeAsync({});
    });

    describe("updatePatient()", function () {
      it("updates only provided patient fields", async () => {
        const patientId = await insertPatient({
          name: "Patient One",
          email: "old@example.com",
          number: "09170000000",
        });

        await updatePatient(patientId, {
          name: "  Patient Updated  ",
          email: "  new@example.com  ",
        });

        const patient = await PatientsCollection.findOneAsync(patientId);
        assert.equal(patient?.name, "patient updated");
        assert.equal(patient?.email, "new@example.com");
        assert.equal(patient?.number, "09170000000");
      });

      it("throws not-found when patient id does not exist", async () => {
        try {
          await updatePatient("missing-patient-id", { name: "Nope" });
          assert.fail("Expected updatePatient to throw not-found");
        } catch (e) {
          assert.instanceOf(e, Meteor.Error);
          assert.equal((e as Meteor.Error).error, "not-found");
        }
      });
    });
  });
}
