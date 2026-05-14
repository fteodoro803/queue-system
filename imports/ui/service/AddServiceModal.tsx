import React, { useState } from "react";
import {
  SERVICE_SHORTCODE_MAX_LENGTH,
  SERVICE_SHORTCODE_MIN_LENGTH,
} from "/imports/api/service";
import { insertService } from "/imports/api/serviceMethods";
import {
  isValidShortcode,
  normaliseShortcode,
} from "/imports/utils/serviceUtils";

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

    const normalisedShortCode: string = normaliseShortcode(shortcode);
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
          <div className="flex flex-col gap-4">
            {/* Name Field */}
            <div>
              <label className="text-xs font-semibold text-base-content/50 uppercase tracking-wider mb-1 block">
                Name <span className="text-error">*</span>
              </label>
              <input
                required
                type="text"
                className="input input-bordered w-full"
                placeholder="Standard Appointment"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            {/* Shortcode Field */}
            <div>
              <label className="text-xs font-semibold text-base-content/50 uppercase tracking-wider mb-1 block">
                Shortcode <span className="text-error">*</span>
              </label>
              <input
                required
                type="text"
                className="input input-bordered w-full"
                placeholder="SA"
                value={shortcode}
                maxLength={SERVICE_SHORTCODE_MAX_LENGTH}
                onChange={(e) => {
                  setShortcode(e.target.value);
                  if (shortcodeError) setShortcodeError("");
                }}
              />
              <p className="mt-1 text-xs text-base-content/60">
                Must be between {SERVICE_SHORTCODE_MIN_LENGTH} and {SERVICE_SHORTCODE_MAX_LENGTH} characters.
              </p>
              {shortcodeError && <p className="mt-1 text-sm text-error">{shortcodeError}</p>}
            </div>

            {/* Duration Field*/}
            <div>
              <label className="text-xs font-semibold text-base-content/50 uppercase tracking-wider mb-1 block">
                Duration (minutes) <span className="text-error">*</span>
              </label>
              <input
                required
                type="number"
                className="input input-bordered w-full"
                placeholder="10"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              />
            </div>

            {/* Cost Field*/}
            <div>
              <label className="text-xs font-semibold text-base-content/50 uppercase tracking-wider mb-1 block">
                Cost (PHP)
              </label>
              <label className="input input-bordered w-full">
                <input
                  type="number"
                  className="grow"
                  placeholder="500"
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                />
                <span className="badge badge-neutral badge-xs">Optional</span>
              </label>
            </div>

            {/* Description Field */}
            <div>
              <label className="text-xs font-semibold text-base-content/50 uppercase tracking-wider mb-1 block">
                Description <span className="text-error">*</span>
              </label>
              <input
                required
                type="text"
                className="input input-bordered w-full"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Priority Field */}
            <div>
              <label className="text-xs font-semibold text-base-content/50 uppercase tracking-wider mb-1 block">
                Priority <span className="text-error">*</span>
              </label>
              <select
                defaultValue="1"
                className="select select-bordered w-full"
                onChange={(e) => setPriority(Number(e.target.value))}
              >
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
              </select>
              <p className="mt-1 text-xs text-base-content/60">
                Higher number means higher priority.
              </p>
            </div>

            {/* Add Button */}
            <button type="submit" className="btn btn-primary btn-sm w-full mt-1" disabled={!name || !duration || !description}>
              Add Service
            </button>
          </div>
        </form>

        <div className="flex gap-2 justify-end">
          {/* Close Button */}
          <button
            className="btn btn-primary"
            onClick={() => {
              setOpen(false);
            }}
          >
            Close
          </button>
        </div>
      </div>

      {/* Closes modal when clicking outside */}
      <div className="modal-backdrop" onClick={() => setOpen(false)} />
    </div>
  );
};
