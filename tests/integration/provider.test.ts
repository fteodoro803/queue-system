import { assert } from "chai";
import { Meteor } from "meteor/meteor";
import { ProviderCollection } from "/imports/api/provider";
import {
  insertProvider,
  selectProvider,
  updateProvider,
} from "/imports/api/providerMethods";

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

    describe("selectProvider()", function () {
      it("returns undefined when no eligible providers match", async () => {
        await insertProvider({
          name: "Unavailable Provider",
          available: false,
          services: [{ id: "svc-1", name: "General", enabled: true }],
        });

        await insertProvider({
          name: "Wrong Service Provider",
          available: true,
          services: [{ id: "svc-2", name: "Dental", enabled: true }],
        });

        await insertProvider({
          name: "Disabled Service Provider",
          available: true,
          services: [{ id: "svc-1", name: "General", enabled: false }],
        });

        const providerId = await selectProvider("svc-1");
        assert.isUndefined(providerId);
      });

      it("returns the only eligible provider id", async () => {
        const eligibleId = await insertProvider({
          name: "Eligible Provider",
          services: [{ id: "svc-1", name: "General", enabled: true }],
        });
        await updateProvider(eligibleId, { available: true });

        const ineligibleId = await insertProvider({
          name: "Ineligible Provider",
          services: [{ id: "svc-1", name: "General", enabled: false }],
        });
        await updateProvider(ineligibleId, { available: true });

        const providerId = await selectProvider("svc-1");
        assert.equal(providerId, eligibleId);
      });

      it("returns one of eligible provider ids when multiple match", async () => {
        const eligibleIdOne = await insertProvider({
          name: "Eligible One",
          services: [{ id: "svc-1", name: "General", enabled: true }],
        });
        const eligibleIdTwo = await insertProvider({
          name: "Eligible Two",
          services: [{ id: "svc-1", name: "General", enabled: true }],
        });
        await updateProvider(eligibleIdOne, { available: true });
        await updateProvider(eligibleIdTwo, { available: true });

        const unavailableId = await insertProvider({
          name: "Unavailable",
          services: [{ id: "svc-1", name: "General", enabled: true }],
        });
        await updateProvider(unavailableId, { available: false });

        const providerId = await selectProvider("svc-1");
        assert.isDefined(providerId);
        assert.include([eligibleIdOne, eligibleIdTwo], providerId as string);
        assert.notEqual(providerId, unavailableId);
      });
    });
  });
}
