import React, { useEffect, useState } from "react";
import { Service } from "/imports/api/service";
import { Field } from "../components/Field";
import {
  BanknotesIcon,
  ChatBubbleBottomCenterIcon,
  ClockIcon,
  IdentificationIcon,
  WrenchIcon,
} from "@heroicons/react/24/outline";
import { DetailsModalButtons } from "/imports/ui/components/DetailsModalButtons";
import { updateService } from "/imports/api/serviceMethods";

export const ServiceDetailsModal = ({
  service,
  open,
  setOpen,
}: {
  service: Service;
  open: boolean;
  setOpen: (value: boolean) => void;
}) => {
  const [name, setName] = useState<string>("");
  const [shortcode, setShortcode] = useState<string>("");
  const [duration, setDuration] = useState<string>("");
  const [cost, setCost] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [hasChanges, setHasChanges] = useState<boolean>(false);

  // React to Service change
  useEffect(() => {
    if (!service) return;

    setName(service.name);
    setShortcode(service.shortcode);
    setDuration(service.duration.toString());
    setCost(service.cost?.toString() ?? "");
    setDescription(service.description);
  }, [service]);

  // Detect changes to enable/disable save button
  useEffect(() => {
    if (!service) return;
    const hasChanges =
      name !== service.name ||
      shortcode !== service.shortcode ||
      duration !== service.duration.toString() ||
      cost !== (service.cost?.toString() ?? "") ||
      description !== service.description;

    setHasChanges(hasChanges);
  }, [name, shortcode, duration, cost, description, service]);

  // Save edits functionality
  const handleSave = async () => {
    const parsedDuration = Number(duration);
    const parsedCost = cost.trim() === "" ? null : Number(cost);

    await updateService(service._id, {
      name,
      shortcode,
      duration: Number.isFinite(parsedDuration)
        ? parsedDuration
        : service.duration,
      cost: Number.isFinite(parsedCost) ? parsedCost : null,
      description,
    });

    setHasChanges(false);
  };

  // Cancel edits functionality
  const handleCancel = () => {
    setName(service.name);
    setShortcode(service.shortcode);
    setDuration(service.duration.toString());
    setCost(service.cost?.toString() ?? "");
    setDescription(service.description);

    setHasChanges(false);
  };

  /* Closed */
  if (!open) return null;

  return (
    <div className="modal modal-open" role="dialog">
      <div className="modal-box relative p-0 overflow-hidden max-w-lg">
        {/* Header */}
        <div className="px-6 py-5 bg-base-200 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <WrenchIcon className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-lg leading-none">
              {name || "Service Details"}
            </h3>
            <p className="text-sm text-base-content/50 mt-0.5">
              Edit service information
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
          {/* Name */}
          <div>
            <label className="text-xs font-semibold text-base-content/50 uppercase tracking-wider mb-1 block">
              Name
            </label>
            <Field
              value={name}
              onChange={setName}
              additionalAttributes="bg-base-100"
              mode="editable"
              type="text"
              placeholder="N/A"
              icon={WrenchIcon}
            />
          </div>

          {/* Shortcode */}
          <div>
            <label className="text-xs font-semibold text-base-content/50 uppercase tracking-wider mb-1 block">
              Shortcode
            </label>
            <Field
              value={shortcode}
              onChange={setShortcode}
              additionalAttributes="bg-base-100"
              mode="editable"
              type="text"
              placeholder="N/A"
              icon={IdentificationIcon}
            />
          </div>

          {/* Duration */}
          <div>
            <label className="text-xs font-semibold text-base-content/50 uppercase tracking-wider mb-1 block">
              Duration (mins)
            </label>
            <Field
              value={duration}
              onChange={setDuration}
              additionalAttributes="bg-base-100"
              type="number"
              placeholder="N/A"
              icon={ClockIcon}
              mode="editable"
            />
          </div>

          {/* Cost */}
          <div>
            <label className="text-xs font-semibold text-base-content/50 uppercase tracking-wider mb-1 block">
              Cost ($)
            </label>
            <Field
              value={cost}
              onChange={setCost}
              additionalAttributes="bg-base-100"
              type="number"
              placeholder="N/A"
              icon={BanknotesIcon}
              mode="editable"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-semibold text-base-content/50 uppercase tracking-wider mb-1 block">
              Description
            </label>
            <Field
              value={description}
              onChange={setDescription}
              additionalAttributes="bg-base-100"
              type="text"
              placeholder="N/A"
              icon={ChatBubbleBottomCenterIcon}
              mode="editable"
            />
          </div>

          <div className="pt-1">
            <DetailsModalButtons
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
};
