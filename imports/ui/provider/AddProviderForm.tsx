import React, { useState } from "react";
import { EmailField, NameField, NumberField } from "../components/Field";
import { insertProvider } from "/imports/api/providerMethods";

export const AddProviderForm = ({ flat = false }: { flat?: boolean }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [number, setNumber] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || name.length == 0) return;

    await insertProvider({
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

  const fields = (
    <div className="flex flex-col gap-4">
      <div>
        <label className="text-xs font-semibold text-base-content/50 uppercase tracking-wider mb-1 block">
          Name <span className="text-error">*</span>
        </label>
        <NameField
          value={name}
          onChange={setName}
          placeholder="Your Name"
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

      <button type="submit" className="btn btn-primary btn-sm w-full mt-1" disabled={!name}>
        Add Provider
      </button>
    </div>
  );

  if (flat) {
    return <form onSubmit={handleSubmit}>{fields}</form>;
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="bg-base-100 border border-base-300 rounded-xl shadow-sm overflow-hidden w-xs">
        <div className="px-5 py-4 bg-base-200">
          <h3 className="font-bold text-sm">Service Provider</h3>
        </div>
        <div className="px-5 py-4">{fields}</div>
      </div>
    </form>
  );
};
