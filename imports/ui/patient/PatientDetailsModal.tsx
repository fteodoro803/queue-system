import React, { useEffect, useState } from "react";
import { Patient } from "/imports/api/patient";
import { EmailField } from "/imports/ui/components/EmailField";
import { NumberField } from "/imports/ui/components/NumberField";
import { Avatar } from "/imports/ui/components/Avatar";
import { NameField } from "/imports/ui/components/NameField";
import { updatePatient } from "/imports/api/patientsMethods";

export const PatientDetailsModal = ({
  patient,
  open,
  setOpen,
}: {
  patient: Patient;
  open: boolean;
  setOpen: (value: boolean) => void;
}) => {
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [number, setNumber] = useState<string>("");
  const [hasChanges, setHasChanges] = useState<boolean>(false);

  // Sync selected patient details with local state
  useEffect(() => {
    if (!patient) return;

    setName(patient.name);
    setEmail(patient.email ?? "");
    setNumber(patient.number ?? "");
  }, [patient]);

  // Detect changes to enable/disable save button
  useEffect(() => {
    if (!patient) return;
    const hasChanges =
      name !== patient.name ||
      email !== (patient.email ?? "") ||
      number !== (patient.number ?? "");
    setHasChanges(hasChanges);
  }, [name, email, number, patient]);

  // Save edits functionality
  const handleSave = async () => {
    await updatePatient(patient._id, {
      name: name,
      email: email,
      number: number,
    });

    setHasChanges(false);
  };

  // Cancel edits functionality
  const handleCancel = async () => {
    setName(patient.name);
    setEmail(patient.email ?? "");
    setNumber(patient.number ?? "");

    setHasChanges(false);
  };

  // Closed
  if (!open) return null;

  // Open
  return (
    <div className="modal modal-open" role={"dialog"}>
      <div className="modal-box">
        {/*Avatar*/}
        <div className="flex justify-center">
          <Avatar profile={patient} />
        </div>

        <fieldset className="fieldset">
          {/* Name */}
          <label className="label">Name</label>
          <NameField
            value={name}
            onChange={setName}
            additionalAttributes={
              "input input-ghost disabled:opacity-100 bg-base-100 text-black"
            }
            placeholder={"N/A"}
          />

          {/* Email */}
          <label className="label">Email</label>
          <EmailField
            value={email}
            onChange={setEmail}
            additionalAttributes={
              "input-ghost disabled:opacity-100 bg-base-100 text-black"
            }
            placeholder={"N/A"}
          />

          {/* Number */}
          <label className="label">Number</label>
          <NumberField
            value={number}
            onChange={setNumber}
            additionalAttributes={
              "input-ghost disabled:opacity-100 bg-base-100 text-black"
            }
            placeholder={"N/A"}
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
        {/*Close Button*/}
        {!hasChanges && (
          <div className=" flex gap-2 justify-end">
            <button
              className="btn"
              onClick={() => {
                setOpen(false);
              }}
            >
              Close
            </button>
          </div>
        )}

        {/*Edit Buttons*/}
        {hasChanges && (
          <div className=" flex gap-2 justify-end">
            {/*Save Button*/}
            <button
              type="button"
              className="btn bg-green-400"
              onClick={handleSave}
            >
              Save
            </button>

            {/*Cancel Button*/}
            <button
              type="button"
              className="btn bg-red-400"
              onClick={handleCancel}
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
