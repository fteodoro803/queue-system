import React from "react";
import { UserIcon } from "@heroicons/react/24/outline";

interface NameFieldProps {
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
  placeholder?: string;
  additionalAttributes?: string;
}

export const NameField: React.FC<NameFieldProps> = ({
                                                      value,
                                                      onChange,
                                                      placeholder = "",
                                                      disabled = false,
                                                      additionalAttributes = "",
                                                    }) => {
  const baseAttributes: string = "input";

  return (
    <>
      <label className={`${baseAttributes} ${additionalAttributes}`}>
        {/*Icon*/}
        <UserIcon className="h-5 w-5 text-base-content/50"/>

        {/*Input*/}
        <input
          required
          type="text"
          className="grow"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
        />
      </label>
    </>
  );
};