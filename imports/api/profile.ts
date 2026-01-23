import { Mongo } from "meteor/mongo";

export interface Profile {
  _id?: string;
  name: string;
  email?: string;
  number?: string;

  icon?: string;
  createdAt: Date;
}