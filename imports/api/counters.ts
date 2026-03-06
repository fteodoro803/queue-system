import { Mongo } from "meteor/mongo";

export interface Counter {
  _id: string; // Service ID
  count: number;
}

export const CountersCollection = new Mongo.Collection<Counter>("counters");
