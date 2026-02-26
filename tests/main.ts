import { Meteor } from "meteor/meteor";
import assert from "assert";
import "./unit/appointmentUtils.test";
import "./integration/appointmentUtils.test";
import { TEST_SETTINGS } from "../imports/dev/settings";

describe("queue-system", function () {
  it("package.json has correct name", async function () {
    const { name } = await import("../package.json");
    assert.strictEqual(name, "queue-system");
  });

  if (Meteor.isClient) {
    it("client is not server", function () {
      assert.strictEqual(Meteor.isServer, false);
    });
  }

  if (Meteor.isServer) {
    it("server is not client", function () {
      assert.strictEqual(Meteor.isClient, false);
    });
  }

  it("test settings are disabled", function () {
    for (const [key, value] of Object.entries(TEST_SETTINGS)) {
      assert.strictEqual(value, false, `TEST_SETTINGS.${key} should be false`);
    }
  });
});
