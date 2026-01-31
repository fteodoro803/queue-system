import React, { useState } from "react";
import { Meteor } from "meteor/meteor";

export const AddServiceModal = ({open, setOpen}: {
  open: boolean;
  setOpen: (boolean) => void;
}) => {
  const [name, setName] = useState("");
  const [duration, setDuration] = useState("");
  const [description, setDescription] = useState("");
  const [cost, setCost] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || name.length == 0) return;

    await Meteor.callAsync("services.insert", {
      name,
      cost,
      duration,
      description,
    });

    // Clear fields and close modal
    setName("");
    setDuration("");
    setCost("");
    setDescription("");
    setOpen(false);
  };

  if (!open) {
    return null;
  }

  return (
    <div className="modal modal-open" role={"dialog"}>
      <div className="modal-box">

        {/*Close Button*/}
        <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                onClick={() => setOpen(false)}>✕
        </button>

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

            {/* Cost Field*/}
            <label className="label">Cost (in Pesos)</label>
            <label
              className="input">
              <input
                type="number"
                className="grow"
                placeholder="500"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
              />
              <span className="badge badge-neutral badge-xs">Optional</span>
            </label>

            {/* Description Field */}
            <label className="label">Description *</label>
            <input
              required
              type="text"
              className="input"
              placeholder=""
              value={description}
              onChange={(e) => setDescription(e.target.value)}/>


            {/* Add Button */}
            <button type="submit" className="btn">Add</button>

          </fieldset>
        </form>
      </div>
    </div>
  );
};