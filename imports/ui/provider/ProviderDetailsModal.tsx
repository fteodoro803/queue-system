import React, { useEffect, useState } from "react";
import { EmailField } from "/imports/ui/components/EmailField";
import { NumberField } from "/imports/ui/components/NumberField";
import { Avatar } from "/imports/ui/components/Avatar";
import { NameField } from "/imports/ui/components/NameField";
import { Provider } from "../../api/provider";
import { updateProvider } from "../../api/providerMethods";
import { ProviderServicesTable } from "./ProviderServicesTable";

export const ProviderDetailsModal = ({
  provider,
  open,
  setOpen,
}: {
  provider: Provider;
  open: boolean;
  setOpen: (value: boolean) => void;
}) => {
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [number, setNumber] = useState<string>("");
  const [hasChanges, setHasChanges] = useState<boolean>(false);

  // React to Provider change
  useEffect(() => {
    if (!provider) return;

    setName(provider.name);
    setEmail(provider.email ?? "");
    setNumber(provider.number ?? "");
  }, [provider]);

  // Save edits functionality
  const handleSave = async () => {
    await updateProvider(provider._id, {
      name: name,
      email: email,
      number: number,
    });

    setHasChanges(false);
  };

  // Cancel edits functionality
  const handleCancel = async () => {
    setName(provider.name);
    setEmail(provider.email ?? "");
    setNumber(provider.number ?? "");

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
          <Avatar profile={provider} />
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
          {/* <label className="label">System ID</label>
          <GenericField
            value={provider._id}
            additionalAttributes="input input-ghost disabled:opacity-100 bg-base-100 text-black"
            disabled={true}
          /> */}
        </fieldset>

        <ProviderServicesTable provider={provider} />

        {/*Close Button*/}
        <div className="justify-end flex">
          <button
            className="btn"
            onClick={() => {
              setOpen(false);
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
