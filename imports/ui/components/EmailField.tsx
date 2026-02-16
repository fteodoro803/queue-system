import React from "react";
import { EnvelopeIcon } from "@heroicons/react/24/outline";
import { GenericField, GenericFieldProps } from "./GenericField";

type EmailFieldProps = Omit<GenericFieldProps, "icon">;

export const EmailField: React.FC<EmailFieldProps> = (props) => {
  const baseAttributes: string = "validator";

  return (
    <>
      <GenericField
        {...props}
        additionalAttributes={`${baseAttributes} ${props.additionalAttributes}`}
        type="email"
        icon={EnvelopeIcon}
      />
      <div className="validator-hint hidden">Enter valid email address</div>
    </>
  );
};
