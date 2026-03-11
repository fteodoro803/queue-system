import React, { useEffect, useState } from "react";
import { Service } from "/imports/api/service";
import { GenericField } from "../components/GenericField";
import {
  BanknotesIcon,
  ChartBarIcon,
  ChatBubbleBottomCenterIcon,
  ClockIcon,
  WrenchIcon,
} from "@heroicons/react/24/outline";
import { ModalButtons } from "../components/ModalButtons";

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
  const [duration, setDuration] = useState<string>("");
  const [cost, setCost] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [hasChanges, setHasChanges] = useState<boolean>(false);
  const [averageDuration, setAverageDuration] = useState<string>("");

  // React to Service change
  useEffect(() => {
    if (!service) return;

    setName(service.name);
    setDuration(service.duration.toString());
    setAverageDuration(service.avgDuration?.toString() ?? "N/A");
    setCost(service.cost?.toString() ?? "");
    setDescription(service.description);
  }, [service]);

  // Detect changes to enable/disable save button
  useEffect(() => {
    if (!service) return;
    const hasChanges =
      name !== service.name ||
      duration !== service.duration.toString() ||
      cost !== (service.cost?.toString() ?? "") ||
      description !== service.description;

    setHasChanges(hasChanges);
  }, [name, duration, cost, description, service]);

  // todo: implement save and cancel functionality

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
            onClick={() => setOpen(false)}
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
            <GenericField
              value={name}
              onChange={setName}
              additionalAttributes="input input-bordered w-full bg-base-100"
              mode="editable"
              type="text"
              placeholder="N/A"
              icon={WrenchIcon}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-base-content/50 uppercase tracking-wider mb-1 block">
              Duration (mins)
            </label>
            <GenericField
              value={duration}
              onChange={setDuration}
              additionalAttributes="input input-bordered w-full bg-base-100"
              type="number"
              placeholder="N/A"
              icon={ClockIcon}
              mode="editable"
            />
            <div className="flex items-center gap-1.5 mt-1.5 text-xs text-base-content/50">
              <ChartBarIcon className="h-3 w-3" />
              <span>
                Avg:{" "}
                <span className="font-semibold text-base-content/70">
                  {averageDuration} mins
                </span>
              </span>
            </div>
          </div>

          {/* Cost */}
          <div>
            <label className="text-xs font-semibold text-base-content/50 uppercase tracking-wider mb-1 block">
              Cost ($)
            </label>
            <GenericField
              value={cost}
              onChange={setCost}
              additionalAttributes="input input-bordered w-full bg-base-100"
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
            <GenericField
              value={description}
              onChange={setDescription}
              additionalAttributes="input input-bordered w-full bg-base-100"
              type="text"
              placeholder="N/A"
              icon={ChatBubbleBottomCenterIcon}
              mode="editable"
            />
          </div>

          <div className="pt-1">
            <ModalButtons setOpen={setOpen} hasChanges={hasChanges} />
          </div>
        </div>
      </div>

      <div className="modal-backdrop" onClick={() => setOpen(false)} />
    </div>
  );

  /* Open OLD */
  return (
    <div className="modal modal-open" role={"dialog"}>
      <div className="modal-box">
        <fieldset className="fieldset">
          {/* Name */}
          <label className="label">Name</label>
          <GenericField
            value={name}
            onChange={setName}
            additionalAttributes={
              "input input-ghost disabled:opacity-100 bg-base-100"
            }
            mode="editable"
            type="text"
            placeholder={"N/A"}
            icon={WrenchIcon}
          />

          {/* Duration */}
          <label className="label">Duration</label>
          <GenericField
            value={duration}
            onChange={setDuration}
            additionalAttributes={
              "input input-ghost disabled:opacity-100 bg-base-100"
            }
            type="number"
            placeholder={"N/A"}
            icon={ClockIcon}
            mode="editable"
          />

          {/* Average Duration */}
          <label className="label">Average Duration</label>
          <GenericField
            value={averageDuration}
            additionalAttributes={
              "input input-ghost disabled:opacity-100 bg-base-100"
            }
            type="number"
            placeholder={"N/A"}
            icon={ClockIcon}
            mode="editable"
          />

          {/* Cost */}
          <label className="label">Cost</label>
          <GenericField
            value={cost}
            onChange={setCost}
            additionalAttributes={
              "input input-ghost disabled:opacity-100 bg-base-100"
            }
            type="number"
            placeholder={"N/A"}
            icon={BanknotesIcon}
            mode="editable"
          />
          {/* Description */}
          <label className="label">Description</label>
          <GenericField
            value={description}
            onChange={setDescription}
            additionalAttributes={
              "input input-ghost disabled:opacity-100 bg-base-100"
            }
            type="text"
            placeholder={"N/A"}
            icon={ChatBubbleBottomCenterIcon}
            mode="editable"
          />
        </fieldset>

        <ModalButtons setOpen={setOpen} hasChanges={hasChanges} />
      </div>

      {/* Closes modal when clicking outside */}
      <div
        className="modal-backdrop"
        onClick={() => {
          // handleCancel();
          setOpen(false);
        }}
      />
    </div>
  );
};
