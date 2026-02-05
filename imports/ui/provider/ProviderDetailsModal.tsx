import React, { useEffect, useState } from "react";
import { EmailField } from "/imports/ui/components/EmailField";
import { NumberField } from "/imports/ui/components/NumberField";
import { Avatar } from "/imports/ui/components/Avatar";
import { NameField } from "/imports/ui/components/NameField";
import { Provider } from "../../api/provider";
import { updateProvider } from "../../api/providerMethods";
import { ProviderServicesTable } from "./ProviderServicesTable";
import { ServiceTable } from "../service/ServiceTable";
import { GenericField } from "../components/GenericField";

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
  const [isEditing, setIsEditing] = useState<boolean>(false);

  // React to Patient change
  useEffect(() => {
    if (!provider) return;

    setName(provider.name);
    setEmail(provider.email ?? "");
    setNumber(provider.number ?? "");
    setIsEditing(false); // reset edit mode when patient changes
  }, [provider]);

  const toggleEditing = () => {
    isEditing ? setIsEditing(false) : setIsEditing(true);
  };

  // Save edits functionality
  const handleSave = async () => {
    await updateProvider(provider._id, {
      name: name,
      email: email,
      number: number,
    });

    toggleEditing();
  };

  // Cancel edits functionality
  const handleCancel = async () => {
    setName(provider.name);
    setEmail(provider.email ?? "");
    setNumber(provider.number ?? "");

    toggleEditing();
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
            disabled={!isEditing}
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
            disabled={!isEditing}
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
            disabled={!isEditing}
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
