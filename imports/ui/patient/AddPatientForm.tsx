import React, { useState } from "react";
import { EmailField } from "/imports/ui/components/EmailField";
import { NumberField } from "/imports/ui/components/NumberField";
import { NameField } from "/imports/ui/components/NameField";
import { insertPatient } from "/imports/api/patientsMethods";
import { UserPlusIcon } from "@heroicons/react/24/outline";
import { Patient, PatientsCollection } from "/imports/api/patient";

export const AddPatientForm = ({
  flat = false,
  setPatient,
}: {
  flat?: boolean;
  setPatient?: (patient: Patient) => void;
}) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [number, setNumber] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || name.length == 0) return;

    // Insert patient to Database
    const newPatientId = (await insertPatient({
      name,
      email,
      number,
    })) as string;

    if (setPatient && newPatientId) {
      const newPatient = await PatientsCollection.findOneAsync(newPatientId);
      if (newPatient) setPatient(newPatient);
    }

    // Clear fields
    setName("");
    setEmail("");
    setNumber("");
  };

  const fields = (
    <div className="flex flex-col gap-4">
      <div>
        <label className="text-xs font-semibold text-base-content/50 uppercase tracking-wider mb-1 block">
          Name <span className="text-error">*</span>
        </label>
        <NameField
          value={name}
          onChange={setName}
          placeholder="Full name"
          mode="write"
          additionalAttributes="input-bordered w-full"
        />
      </div>
      <div>
        <label className="text-xs font-semibold text-base-content/50 uppercase tracking-wider mb-1 block">
          Email
        </label>
        <EmailField
          value={email}
          onChange={setEmail}
          placeholder="mail@site.com"
          mode="write"
          additionalAttributes="input-bordered w-full"
        />
      </div>
      <div>
        <label className="text-xs font-semibold text-base-content/50 uppercase tracking-wider mb-1 block">
          Phone
        </label>
        <NumberField
          value={number}
          onChange={setNumber}
          placeholder="0900 000 0000"
          mode="write"
          additionalAttributes="input-bordered w-full"
        />
      </div>
      <button
        type="submit"
        className="btn btn-primary btn-sm w-full mt-1"
        disabled={!name}
      >
        Add Patient
      </button>
    </div>
  );

  if (flat) {
    return <form onSubmit={handleSubmit}>{fields}</form>;
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="bg-base-100 border border-base-300 rounded-xl shadow-sm overflow-hidden w-xs">
        <div className="px-5 py-4 bg-base-200 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <UserPlusIcon className="h-4 w-4" />
          </div>
          <h3 className="font-bold text-sm">New Patient</h3>
        </div>
        <div className="px-5 py-4">{fields}</div>
      </div>
    </form>
  );
};
