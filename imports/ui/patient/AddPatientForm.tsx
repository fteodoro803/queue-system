import React, {useState} from "react";
import {Meteor} from "meteor/meteor";

export const AddPatientForm = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [number, setNumber] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || name.length == 0) return;

    await Meteor.callAsync("patients.insert", {
      name: name.trim(),
      email: email.length > 0 ? email.trim() : null,
      number: number.length > 0 ? number.trim() : null,
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
        <input
          required
          type="text"
          className="input"
          placeholder="Little Timmy"
          value={name}
          onChange={(e) => setName(e.target.value)}/>

        {/* Email Field */}
        <label className="label">Email</label>
        <label className="input validator">
          <svg className="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <g
              strokeLinejoin="round"
              strokeLinecap="round"
              strokeWidth="2.5"
              fill="none"
              stroke="currentColor"
            >
              <rect width="20" height="16" x="2" y="4" rx="2"></rect>
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
            </g>
          </svg>
          <input
            type="email"
            placeholder="mail@site.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <div className="validator-hint hidden">Enter valid email address</div>

        {/* Number Field */}
        <label className="label">Number</label>
        <label className="input validator">
          <svg className="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
            <g fill="none">
              <path
                d="M7.25 11.5C6.83579 11.5 6.5 11.8358 6.5 12.25C6.5 12.6642 6.83579 13 7.25 13H8.75C9.16421 13 9.5 12.6642 9.5 12.25C9.5 11.8358 9.16421 11.5 8.75 11.5H7.25Z"
                fill="currentColor"
              ></path>
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M6 1C4.61929 1 3.5 2.11929 3.5 3.5V12.5C3.5 13.8807 4.61929 15 6 15H10C11.3807 15 12.5 13.8807 12.5 12.5V3.5C12.5 2.11929 11.3807 1 10 1H6ZM10 2.5H9.5V3C9.5 3.27614 9.27614 3.5 9 3.5H7C6.72386 3.5 6.5 3.27614 6.5 3V2.5H6C5.44771 2.5 5 2.94772 5 3.5V12.5C5 13.0523 5.44772 13.5 6 13.5H10C10.5523 13.5 11 13.0523 11 12.5V3.5C11 2.94772 10.5523 2.5 10 2.5Z"
                fill="currentColor"
              ></path>
            </g>
          </svg>
          <input
            type="tel"
            className="tabular-nums"
            placeholder="0900 000 0000"
            pattern="[0-9]*"
            minLength="11"
            maxLength="11"
            title="Must be 11 digits"
            value={number}
            onChange={(e) => setNumber(e.target.value)}
          />
        </label>
        <p className="validator-hint">Must be 11 digits</p>

        {/* Add Button */}
        <button type="submit" className="btn">Add</button>

      </fieldset>
    </form>
  );
}