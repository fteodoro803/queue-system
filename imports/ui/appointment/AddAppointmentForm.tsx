import React, { useState } from "react";
import { Meteor } from "meteor/meteor";

export const AddAppointmentForm = () => {
  const [type, setType] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!type || type.length == 0) return;

    await Meteor.callAsync("appointments.insert", {
      type: type.trim(),
    });

    // reset field
    setType("");
  };

  return (
    <form className="appointment-form" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Appointment Type (required)"
        value={type}
        onChange={(e) => setType(e.target.value)} // update state on input
      />

      <button type="submit">Add</button>
    </form>
  );
};
