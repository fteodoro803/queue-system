import React, {useState} from "react";
import {Meteor} from "meteor/meteor";

export const CreateServiceTypeForm = () => {
  const [name, setName] = useState("");
  const [duration, setDuration] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || name.length == 0) return;

    await Meteor.callAsync("serviceTypes.insert", {
      name,
      duration,
    });

    // Clear fields
    setName("");
    setDuration("");
  };

  return (
    <form onSubmit={handleSubmit}>
      <fieldset className="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4">
        <legend className="fieldset-legend">Service Type</legend>

        {/* Name Field */}
        <label className="label">Name *</label>
        <input
          required
          type="text"
          className="input"
          placeholder="Standard Appointment"
          value={name}
          onChange={(e) => setName(e.target.value)}/>

        {/* Duration Field*/}
        <label className="label">Duration (in minutes) *</label>
        <input
          required
          type="number"
          className="input"
          placeholder="10"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}/>

        {/* Add Button */}
        <button type="submit" className="btn">Add</button>

      </fieldset>
    </form>
  );
}