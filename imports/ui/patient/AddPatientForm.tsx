import React, { useState } from "react";
import { Meteor } from "meteor/meteor";
import { EmailField } from "/imports/ui/components/EmailField";
import { NumberField } from "/imports/ui/components/NumberField";
import { NameField } from "/imports/ui/components/NameField";

export const AddPatientForm = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [number, setNumber] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || name.length == 0) return;

    await Meteor.callAsync("patients.insert", {
      name,
      email,
      number,
      // todo: add icon
    });

    // Clear fields
    setName("");
    setEmail("");
    setNumber("");
  };

  return (
    <form onSubmit={handleSubmit}>
      <fieldset className="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4">
        <legend className="fieldset-legend">Patient</legend>

        {/* Name Field */}
        <label className="label">Name *</label>
        <NameField value={name} onChange={setName} placeholder={"Your Name"} />

        {/* Email Field */}
        <label className="label">Email</label>
        <EmailField
          value={email}
          onChange={setEmail}
          placeholder={"mail@site.com"}
        />

        {/* Number Field */}
        <label className="label">Number</label>
        <NumberField
          value={number}
          onChange={setNumber}
          placeholder={"0900 000 0000"}
        />

        {/* Add Button */}
        <button type="submit" className="btn">
          Add
        </button>
      </fieldset>
    </form>
  );
};
