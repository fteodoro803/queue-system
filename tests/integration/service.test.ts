import { assert } from "chai";
import { Meteor } from "meteor/meteor";
import { ServicesCollection } from "/imports/api/service";
import { insertService, updateService } from "/imports/api/serviceMethods";

if (Meteor.isServer) {
  describe("[INTEGRATION] serviceMethods", function () {
    beforeEach(async () => {
      await ServicesCollection.removeAsync({});
    });

    describe("updateService()", function () {
      it("updates only provided service fields", async () => {
        const serviceId = await insertService({
          name: "General Consultation",
          shortcode: "GC",
          duration: 30,
          description: "Initial consult",
          priority: 1,
          cost: 500,
        });

        await updateService(serviceId, {
          name: "  Premium Consultation  ",
          duration: 45,
          description: "  Extended consult  ",
          cost: null,
        });

        const service = await ServicesCollection.findOneAsync(serviceId);
        assert.equal(service?.name, "Premium Consultation");
        assert.equal(service?.duration, 45);
        assert.equal(service?.description, "Extended consult");
        assert.isNull(service?.cost ?? null);
        assert.equal(service?.shortcode, "GC");
      });

      it("throws not-found when service id does not exist", async () => {
        try {
          await updateService("missing-service-id", { name: "Nope" });
          assert.fail("Expected updateService to throw not-found");
        } catch (e) {
          assert.instanceOf(e, Meteor.Error);
          assert.equal((e as Meteor.Error).error, "not-found");
        }
      });
    });
  });
}
