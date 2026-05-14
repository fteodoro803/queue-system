import React, { useState } from "react";
import {
  SERVICE_SHORTCODE_MAX_LENGTH,
  SERVICE_SHORTCODE_MIN_LENGTH,
} from "/imports/api/service";
import { insertService } from "/imports/api/serviceMethods";
import { isValidShortcode } from "/imports/utils/serviceUtils";
import { normaliseString } from "/imports/utils/utils";

interface AddServiceModalProps {
  open: boolean;
  setOpen: (value: boolean) => void;
}

export const AddServiceModal = ({ open, setOpen }: AddServiceModalProps) => {
  const [name, setName] = useState("");
  const [shortcode, setShortcode] = useState("");
  const [duration, setDuration] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState(1);
  const [cost, setCost] = useState("");
  const [shortcodeError, setShortcodeError] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Convert Cost and Duration to numbers
    const durationNum: number = parseInt(duration);
    const costNum: number | null = cost ? parseInt(cost) : null;

    // Early return if name is empty, or duration and cost are NaN
    if (!name || name.length == 0) return;
    if (isNaN(durationNum)) return;
    if (costNum !== null && isNaN(costNum)) return;

    const normalisedShortCode: string = normaliseString(shortcode);
    if (!isValidShortcode(normalisedShortCode)) {
      setShortcodeError(
        `Shortcode must be between ${SERVICE_SHORTCODE_MIN_LENGTH} and ${SERVICE_SHORTCODE_MAX_LENGTH} characters.`,
      );
      return;
    }
    setShortcodeError("");

    await insertService({
      name,
      shortcode: normalisedShortCode,
      cost: costNum,
      duration: durationNum,
      description,
      priority: priority,
    });

    // Clear fields and close modal
    setName("");
    setShortcode("");
    setDuration("");
    setCost("");
    setDescription("");
    setShortcodeError("");
    setOpen(false);
    setPriority(0);
  };

  if (!open) {
    return null;
  }

  return (
    <div className="modal modal-open" role={"dialog"}>
      <div className="modal-box">
        {/*Close Button*/}
        <button
          className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
          onClick={() => setOpen(false)}
        >
          ✕
        </button>

        <form onSubmit={handleSubmit}>
          <fieldset className="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4">
            <legend className="fieldset-legend">Service Type</legend>

            {/* Name Field */}
            <label className="label">Name *</label>
            <input
              required
              type="text"
              className="input"
              placeholder="Standard Appointment"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            {/* Shortcode Field */}
            <label className="label">
              Shortcode (must be between {SERVICE_SHORTCODE_MIN_LENGTH}-
              {SERVICE_SHORTCODE_MAX_LENGTH} characters)
            </label>
            <input
              required
              type="text"
              className="input"
              placeholder="SA"
              value={shortcode}
              maxLength={SERVICE_SHORTCODE_MAX_LENGTH}
              onChange={(e) => {
                setShortcode(e.target.value);
                if (shortcodeError) setShortcodeError("");
              }}
            />
            {shortcodeError && (
              <p className="label text-error">{shortcodeError}</p>
            )}

            {/* Duration Field*/}
            <label className="label">Duration (in minutes) *</label>
            <input
              required
              type="number"
              className="input"
              placeholder="10"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            />

            {/* Cost Field*/}
            <label className="label">Cost (in Pesos)</label>
            <label className="input">
              <input
                type="number"
                className="grow"
                placeholder="500"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
              />
              <span className="badge badge-neutral badge-xs">Optional</span>
            </label>

            {/* Description Field */}
            <label className="label">Description *</label>
            <input
              required
              type="text"
              className="input"
              placeholder=""
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            {/* Priority Field */}
            <label className="label">Priority *</label>
            <select
              defaultValue="Pick a color"
              className="select"
              onChange={(e) => setPriority(Number(e.target.value))}
            >
              <option disabled={true}>Higher number is higher priority</option>
              <option>1</option>
              <option>2</option>
              <option>3</option>
            </select>

            {/* Add Button */}
            <button type="submit" className="btn btn-primary">
              Add
            </button>
          </fieldset>
        </form>
      </div>

      {/* Closes modal when clicking outside */}
      <div className="modal-backdrop" onClick={() => setOpen(false)} />
    </div>
  );
};
