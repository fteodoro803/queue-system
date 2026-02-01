import React from "react";
import { EnvelopeIcon } from "@heroicons/react/24/outline";

interface EmailFieldProps {
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
  placeholder?: string;
  additionalAttributes?: string;
}

export const EmailField: React.FC<EmailFieldProps> = ({
  value,
  onChange,
  placeholder = "",
  disabled = false,
  additionalAttributes = "",
}) => {
  const baseAttributes: string = "input validator";

  return (
    <>
      <label className={`${baseAttributes} ${additionalAttributes}`}>
        {/*Icon*/}
        <EnvelopeIcon className="h-5 w-5 text-base-content/50" />

        {/*Input*/}
        <input
          type="email"
          disabled={disabled}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </label>
      <div className="validator-hint hidden">Enter valid email address</div>
    </>
  );
};
