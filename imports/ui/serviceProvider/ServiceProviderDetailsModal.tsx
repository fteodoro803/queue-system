import React, { useEffect, useState } from "react";
import { EmailField } from "/imports/ui/components/EmailField";
import { NumberField } from "/imports/ui/components/NumberField";
import { Avatar } from "/imports/ui/components/Avatar";
import { NameField } from "/imports/ui/components/NameField";
import { ServiceProvider } from "/imports/api/serviceProvider";
import { updateServiceProvider } from "/imports/api/serviceProviderMethods";

export const ServiceProviderDetailsModal = ({
  serviceProvider,
  open,
  setOpen,
}: {
  serviceProvider: ServiceProvider;
  open: boolean;
  setOpen: (value: boolean) => void;
}) => {
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [number, setNumber] = useState<string>("");
  const [isEditing, setIsEditing] = useState<boolean>(false);

  // React to Patient change
  useEffect(() => {
    if (!serviceProvider) return;

    setName(serviceProvider.name);
    setEmail(serviceProvider.email ?? "");
    setNumber(serviceProvider.number ?? "");
    setIsEditing(false); // reset edit mode when patient changes
  }, [serviceProvider]);

  const toggleEditing = () => {
    isEditing ? setIsEditing(false) : setIsEditing(true);
  };

  // Save edits functionality
  const handleSave = async () => {
    await updateServiceProvider(serviceProvider._id, {
      name: name,
      email: email,
      number: number,
    });

    toggleEditing();
  };

  // Cancel edits functionality
  const handleCancel = async () => {
    setName(serviceProvider.name);
    setEmail(serviceProvider.email ?? "");
    setNumber(serviceProvider.number ?? "");

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
          <Avatar profile={serviceProvider} />
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
          <label className="label">System ID</label>
          <input
            type="text"
            className="input input-ghost disabled:opacity-100 bg-base-100 text-black"
            disabled={true}
            value={serviceProvider._id}
          />
        </fieldset>

        {/*Buttons*/}
        {/*Detail Buttons*/}
        {!isEditing && (
          <div className=" flex gap-2 justify-end">
            {/*Edit Button*/}
            <button type="button" className="btn" onClick={toggleEditing}>
              Edit
            </button>

            {/*Close Button*/}
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
        {isEditing && (
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
