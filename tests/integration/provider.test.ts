import { assert } from "chai";
import { Meteor } from "meteor/meteor";
import { ProviderCollection } from "/imports/api/provider";
import { insertProvider, updateProvider } from "/imports/api/providerMethods";

if (Meteor.isServer) {
  describe("[INTEGRATION] providerMethods", function () {
    beforeEach(async () => {
      await ProviderCollection.removeAsync({});
    });

    describe("updateProvider()", function () {
      it("updates only provided provider fields", async () => {
        const providerId = await insertProvider({
          name: "Provider One",
          email: "provider@example.com",
          number: "09171111111",
          services: [{ id: "svc-1", name: "General", enabled: true }],
        });

        await updateProvider(providerId, {
          name: "  Provider Updated  ",
          number: "  09998887777  ",
        });

        const provider = await ProviderCollection.findOneAsync(providerId);
        assert.equal(provider?.name, "Provider Updated");
        assert.equal(provider?.number, "09998887777");
        assert.equal(provider?.email, "provider@example.com");
        assert.deepEqual(provider?.services, [
          { id: "svc-1", name: "General", enabled: true },
        ]);
      });

      it("throws not-found when provider id does not exist", async () => {
        try {
          await updateProvider("missing-provider-id", { name: "Nope" });
          assert.fail("Expected updateProvider to throw not-found");
        } catch (e) {
          assert.instanceOf(e, Meteor.Error);
          assert.equal((e as Meteor.Error).error, "not-found");
        }
      });
    });
  });
}
