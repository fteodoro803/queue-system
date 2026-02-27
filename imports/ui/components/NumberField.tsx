import React from "react";
import { DevicePhoneMobileIcon } from "@heroicons/react/24/outline";
import { GenericField, GenericFieldProps } from "./GenericField";

type NumberFieldProps = Omit<GenericFieldProps, "icon">;

export const NumberField: React.FC<NumberFieldProps> = (props) => {
  const baseAttributes: string = "validator";

  return (
    <>
      <GenericField
        {...props}
        additionalAttributes={`${baseAttributes} ${props.additionalAttributes}`}
        icon={DevicePhoneMobileIcon}
        type="tel"
      />
      <div className="validator-hint hidden">Must be 11 digits</div>
    </>
  );
};
