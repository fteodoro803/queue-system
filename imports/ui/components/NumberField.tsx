import React from "react";
import { DevicePhoneMobileIcon } from "@heroicons/react/24/outline";
import { GenericField } from "./GenericField";

interface NumberField {
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
  placeholder?: string;
  additionalAttributes?: string;
}

// export const NumberField: React.FC<NumberField> = ({
//   value,
//   onChange,
//   placeholder = "",
//   disabled = false,
//   additionalAttributes = "",
// }) => {
//   const baseAttributes: string = "input validator";

//   return (
//     <>
//       <label className={`${baseAttributes} ${additionalAttributes}`}>
//         {/*Icon*/}
//         <DevicePhoneMobileIcon className="h-5 w-5 text-base-content/50" />

//         {/*Input*/}
//         <input
//           type="tel"
//           className="tabular-nums"
//           placeholder={placeholder}
//           pattern="[0-9]*"
//           minLength={11}
//           maxLength={11}
//           title="Must be 11 digits"
//           value={value}
//           onChange={(e) => onChange(e.target.value)}
//           disabled={disabled}
//         />
//       </label>
//       <p className="validator-hint">Must be 11 digits</p>
//     </>
//   );
// };

export const NumberField: React.FC<NumberField> = ({
  value,
  onChange,
  placeholder = "",
  disabled = false,
  additionalAttributes = "",
}) => {
  const baseAttributes: string = "validator";

  return (
    <>
      <GenericField
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        additionalAttributes={`${baseAttributes} ${additionalAttributes}`}
        icon={DevicePhoneMobileIcon}
        type="tel"
      />
      <div className="validator-hint">Must be 11 digits</div>
    </>
  );
};
