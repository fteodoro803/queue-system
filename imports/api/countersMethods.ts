import { Meteor } from "meteor/meteor";
import { CountersCollection } from "/imports/api/counters";

Meteor.methods({
  // Resets the counter for a specific service
  "counters.reset"() {
    return CountersCollection.updateAsync(
      {},
      { $set: { count: 0 } },
      { multi: true },
    );
  },
});

// Exports for the Meteor methods
export async function resetCounter() {
  return Meteor.callAsync("counters.reset");
}
