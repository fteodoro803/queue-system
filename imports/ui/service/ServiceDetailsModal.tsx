import React, { useEffect, useState } from "react";
import { Service } from "/imports/api/service";
import { GenericField } from "../components/GenericField";
import {
  BanknotesIcon,
  ChatBubbleBottomCenterIcon,
  ClockIcon,
  WrenchIcon,
} from "@heroicons/react/24/outline";

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

  // React to Service change
  useEffect(() => {
    if (!service) return;

    setName(service.name);
    setDuration(service.duration.toString());
    setCost(service.cost?.toString() ?? "");
    setDescription(service.description);
  }, [service]);

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
          />
        </fieldset>

        <div className=" flex gap-2 justify-end">
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
      </div>
    </div>
  );
};
