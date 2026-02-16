import React from "react";
import { UserIcon } from "@heroicons/react/24/outline";
import { GenericField, GenericFieldProps } from "./GenericField";

type NameFieldProps = Omit<GenericFieldProps, "icon">;

export const NameField: React.FC<NameFieldProps> = (props) => {
  const baseAttributes: string = "";

  return (
    <>
      <GenericField
        {...props}
        additionalAttributes={`${baseAttributes} ${props.additionalAttributes}`}
        icon={UserIcon}
      />
    </>
  );
};
