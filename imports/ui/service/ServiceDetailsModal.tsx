import React, { useEffect, useState } from "react";
import { Service } from "/imports/api/service";
import { GenericField } from "../components/GenericField";
import {
  BanknotesIcon,
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

  // React to Service change
  useEffect(() => {
    if (!service) return;

    setName(service.name);
    setDuration(service.duration.toString());
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

  /* Open */
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
              "input input-ghost disabled:opacity-100 bg-base-100 text-black"
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
              "input input-ghost disabled:opacity-100 bg-base-100 text-black"
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
              "input input-ghost disabled:opacity-100 bg-base-100 text-black"
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
              "input input-ghost disabled:opacity-100 bg-base-100 text-black"
            }
            type="text"
            placeholder={"N/A"}
            icon={ChatBubbleBottomCenterIcon}
            mode="editable"
          />
        </fieldset>

        <ModalButtons setOpen={setOpen} hasChanges={hasChanges} />
      </div>
    </div>
  );
};
