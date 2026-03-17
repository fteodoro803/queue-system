import React, { useEffect, useState } from "react";
import { EmailField } from "/imports/ui/components/EmailField";
import { NumberField } from "/imports/ui/components/NumberField";
import { Avatar } from "/imports/ui/components/Avatar";
import { NameField } from "/imports/ui/components/NameField";
import { Provider } from "/imports/api/provider";
import { updateProvider } from "/imports/api/providerMethods";
import { ProviderServicesTable } from "/imports/ui/provider/ProviderServicesTable";
import { ModalButtons } from "/imports/ui/components/ModalButtons";
import { UserCircleIcon } from "@heroicons/react/24/outline";

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

  // Sync selected provider details with local state
  useEffect(() => {
    if (!provider) return;

    setName(provider.name);
    setEmail(provider.email ?? "");
    setNumber(provider.number ?? "");
  }, [provider]);

  // Detect changes to enable/disable save button
  useEffect(() => {
    if (!provider) return;
    const hasChanges =
      name !== provider.name ||
      email !== (provider.email ?? "") ||
      number !== (provider.number ?? "");
    setHasChanges(hasChanges);
  }, [name, email, number, provider]);

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

  return (
    <div className="modal modal-open" role="dialog">
      <div className="modal-box relative p-0 overflow-hidden max-w-lg">
        {/* Header */}
        <div className="px-6 py-5 bg-base-200 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <UserCircleIcon className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-lg leading-none">
              {name || "Provider Details"}
            </h3>
            <p className="text-sm text-base-content/50 mt-0.5">
              Edit provider information
            </p>
          </div>
          <button
            className="btn btn-circle btn-ghost btn-sm absolute top-3 right-3"
            onClick={() => {
              handleCancel();
              setOpen(false);
            }}
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 flex flex-col gap-4">
          {/* Avatar */}
          <div className="flex justify-center py-1">
            <Avatar profile={provider} />
          </div>

          {/* Name */}
          <div>
            <label className="text-xs font-semibold text-base-content/50 uppercase tracking-wider mb-1 block">
              Name
            </label>
            <NameField
              value={name}
              onChange={setName}
              additionalAttributes="input input-bordered w-full bg-base-100"
              placeholder="N/A"
              mode="editable"
            />
          </div>

          {/* Email */}
          <div>
            <label className="text-xs font-semibold text-base-content/50 uppercase tracking-wider mb-1 block">
              Email
            </label>
            <EmailField
              value={email}
              onChange={setEmail}
              additionalAttributes="input-bordered bg-base-100"
              placeholder="N/A"
              mode="editable"
            />
          </div>

          {/* Number */}
          <div>
            <label className="text-xs font-semibold text-base-content/50 uppercase tracking-wider mb-1 block">
              Phone Number
            </label>
            <NumberField
              value={number}
              onChange={setNumber}
              additionalAttributes="input-bordered bg-base-100"
              placeholder="N/A"
              mode="editable"
            />
          </div>

          {/* Services Table */}
          <div>
            <label className="text-xs font-semibold text-base-content/50 uppercase tracking-wider mb-2 block">
              Services
            </label>
            <div className="rounded-lg overflow-hidden ring-1 ring-base-300">
              <ProviderServicesTable provider={provider} />
            </div>
          </div>

          <div className="pt-1">
            <ModalButtons
              setOpen={setOpen}
              hasChanges={hasChanges}
              handleSave={handleSave}
              handleCancel={handleCancel}
            />
          </div>
        </div>
      </div>

      <div
        className="modal-backdrop"
        onClick={() => {
          handleCancel();
          setOpen(false);
        }}
      />
    </div>
  );

  // Open OLD
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
              "input input-ghost disabled:opacity-100 bg-base-100"
            }
            placeholder={"N/A"}
            mode="editable"
          />

          {/* Email */}
          <label className="label">Email</label>
          <EmailField
            value={email}
            onChange={setEmail}
            additionalAttributes={
              "input-ghost disabled:opacity-100 bg-base-100"
            }
            placeholder={"N/A"}
            mode="editable"
          />

          {/* Number */}
          <label className="label">Number</label>
          <NumberField
            value={number}
            onChange={setNumber}
            additionalAttributes={
              "input-ghost disabled:opacity-100 bg-base-100"
            }
            placeholder={"N/A"}
            mode="editable"
          />

          {/* System ID */}
          {/* <label className="label">System ID</label>
          <GenericField
            value={provider._id}
            additionalAttributes="input input-ghost disabled:opacity-100 bg-base-100"
            disabled={true}
            mode="read"
          /> */}
        </fieldset>

        {/* Provider's respective Service Table */}
        <ProviderServicesTable provider={provider} />

        {/* Buttons */}
        <ModalButtons
          setOpen={setOpen}
          hasChanges={hasChanges}
          handleSave={handleSave}
          handleCancel={handleCancel}
        />
      </div>

      {/* Closes modal when clicking outside */}
      <div
        className="modal-backdrop"
        onClick={() => {
          handleCancel();
          setOpen(false);
        }}
      />
    </div>
  );
};
