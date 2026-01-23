import React, {useEffect, useState} from "react";
import {Meteor} from "meteor/meteor";
import {Patient} from "/imports/api/patient";

export const PatientDetailsModal = ({patient, open, setOpen}: {
  patient: Patient;
  open: boolean;
  setOpen: (boolean) => void;
}) => {
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [number, setNumber] = useState<string>("");
  const [isEditing, setIsEditing] = useState<boolean>(false)

  // React to Patient change
  useEffect(() => {
    if (!patient) return;

    setName(patient.name);
    setEmail(patient.email ?? "");
    setNumber(patient.number ?? "");
    setIsEditing(false); // reset edit mode when patient changes
  }, [patient]);


  const toggleEditing = () => {
    isEditing ? setIsEditing(false) : setIsEditing(true);
  }

  // Save edits functionality
  const handleSave = async () => {
    await Meteor.callAsync("patients.update", {
      _id: patient._id,
      name: name,
      email: email,
      number: number,
    });

    toggleEditing();
  };

  // Cancel edits functionality
  const handleCancel = async () => {
    setName(patient.name);
    setEmail(patient.email ?? "");
    setNumber(patient.number ?? "")

    toggleEditing();
  };

  // Closed
  if (!open) return null;

  // Open
  return (
    <div className="modal modal-open" role={"dialog"}>
      <div className="modal-box">
        {/*Header*/}

        {!isEditing && (
          <p className="text-2xl font-bold">More Details</p>
        )}
        {isEditing && (
          <p className="text-2xl font-bold">Editing Details</p>
        )}

        {/*Body*/}
        <fieldset className="fieldset">

          {/* Name */}
          <label className="label">Name</label>
          {/*<input type="text" className="input input-ghost placeholder:text-black" placeholder={name}/>*/}
          <input
            type="text"
            className="input input-ghost disabled:opacity-100 bg-base-100 text-black"
            disabled={!isEditing}
            value={name}
            onChange={(e) => setName(e.target.value)} // update state on typing
          />

          {/* Email */}
          <label className="label">Email</label>
          <label className="input validator input-ghost disabled:opacity-100 bg-base-100 text-black">
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
              disabled={!isEditing}
              placeholder={"undefined"}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <div className="validator-hint hidden">Enter valid email address</div>

          {/* Number */}
          <label className="label">Number</label>
          <input
            type="text"
            className="input input-ghost disabled:opacity-100 bg-base-100 text-black"
            disabled={!isEditing}
            value={number}
            onChange={(e) => setNumber(e.target.value)} // update state on typing
          />

          {/* System ID */}
          <label className="label">System ID</label>
          <input
            type="text"
            className="input input-ghost disabled:opacity-100 bg-base-100 text-black"
            disabled={true}
            value={patient._id}
          />

        </fieldset>

        {/*Buttons*/}
        {/*Detail Buttons*/}
        {!isEditing &&
            <div className=" flex gap-2 justify-end">
              {/*Edit Button*/}
                <button type="button" className="btn" onClick={toggleEditing}>Edit</button>

              {/*Close Button*/}
                <button className="btn" onClick={() => {
                  setOpen(false);
                }}>Close
                </button>
            </div>
        }

        {/*Edit Buttons*/}
        {isEditing && <div className=" flex gap-2 justify-end">
          {/*Save Button*/}
            <button type="button" className="btn bg-green-400" onClick={handleSave}>Save</button>

          {/*Cancel Button*/}
            <button type="button" className="btn bg-red-400" onClick={handleCancel}>Cancel</button>
        </div>}

      </div>
    </div>
  )
}