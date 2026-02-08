import {
  CheckIcon,
  PencilSquareIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import React, { useState } from "react";

interface GenericFieldProps {
  value: string;
  onChange?: (val: string) => void;
  disabled?: boolean;
  placeholder?: string;
  additionalAttributes?: string;
  type?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export const GenericField: React.FC<GenericFieldProps> = ({
  value,
  onChange,
  placeholder = "",
  disabled = false,
  additionalAttributes = "",
  type = "text",
  icon,
}) => {
  const baseAttributes: string = "input";
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [draftValue, setDraftValue] = useState<string>(value);

  // Sync with parent value changes while not editing
  React.useEffect(() => {
    if (!isEditing) {
      setDraftValue(value);
    }
  }, [value, isEditing]);

  // Edit Mode - initialise the draft value with the current value
  const handleStartEditing = () => {
    setDraftValue(value);
    setIsEditing(true);
  };

  // Cancel - restores the original value and exits edit mode
  const handleCancel = () => {
    // onChange?.(value);
    setDraftValue(value); // reset draft value to original value
    setIsEditing(false);
  };

  // Save - commits the draft value to the parent component and exits edit mode
  const handleSave = () => {
    onChange?.(draftValue);
    setIsEditing(false);
  };

  return (
    <>
      {/* Field */}
      <div className="flex items-center gap-2 mb-1 group">
        <label className={`${baseAttributes} ${additionalAttributes}`}>
          {/*Icon*/}
          {icon &&
            React.createElement(icon, {
              className: "h-5 w-5 text-base-content/50",
            })}

          {/*Input*/}
          <input
            required
            type={type}
            className="grow"
            placeholder={placeholder}
            value={draftValue}
            onChange={(e) => setDraftValue(e.target.value)}
            disabled={disabled}
            readOnly={!isEditing} // only allows input when in Edit Mode
          />
        </label>

        {/* Buttons */}
        {/* Visible when not disabled, and changes depending on isEditing */}
        {!disabled && (
          <div>
            {!isEditing ? (
              <div>
                {/* Edit Button */}
                <button
                  className="btn opacity-0 group-hover:opacity-100"
                  onClick={handleStartEditing}
                >
                  <PencilSquareIcon className="h-5 w-5 text-base-content/50" />
                </button>
              </div>
            ) : (
              <div>
                {/* Cancel Button */}
                <button className="btn" onClick={handleCancel}>
                  <XMarkIcon className="h-5 w-5 text-base-content/50" />
                </button>

                {/* Save Button */}
                <button className="btn" onClick={handleSave}>
                  <CheckIcon className="h-5 w-5 text-base-content/50" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};
