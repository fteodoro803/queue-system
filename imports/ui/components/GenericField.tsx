import React from "react";

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

  return (
    <>
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
        />
      </label>
    </>
  );
};
