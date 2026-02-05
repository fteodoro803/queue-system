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

  const [originalValue, setOriginalValue] = useState<string>(value);

  // When entering edit mode, capture the current value
  const handleStartEditing = () => {
    setOriginalValue(value); // Store snapshot
    setIsEditing(true);
  };

  // Cancel restores the original
  const handleCancel = () => {
    onChange?.(originalValue); // Restore snapshot
    setIsEditing(false);
  };

  // Save just exits edit mode, keeping the current value
  const handleSave = () => {
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
            value={value}
            onChange={onChange ? (e) => onChange(e.target.value) : () => {}}
            disabled={disabled}
            // Editable when hovered/selected
            readOnly={!isEditing}
          />
        </label>

        {/* Buttons */}
        {!isEditing && (
          <div>
            {/* Edit Button */}
            <button
              className="btn opacity-0 group-hover:opacity-100"
              onClick={handleStartEditing}
            >
              <PencilSquareIcon className="h-5 w-5 text-base-content/50" />
            </button>
          </div>
        )}
        {isEditing && (
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
    </>
  );
};
