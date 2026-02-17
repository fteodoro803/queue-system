import React from "react";

interface StepsProps {
  step: number;
}

export const Steps = ({ step }: StepsProps) => {
  return (
    <ul className="steps">
      {/* Highlight step if current step is equal or higher */}
      <li className={`step ${step >= 1 ? "step-primary" : ""}`}>Service</li>
      <li className={`step ${step >= 2 ? "step-primary" : ""}`}>Provider</li>
      <li className={`step ${step >= 3 ? "step-primary" : ""}`}>Date</li>
      <li className={`step ${step >= 4 ? "step-primary" : ""}`}>Patient</li>
      <li className={`step ${step >= 5 ? "step-primary" : ""}`}>Confirm</li>
    </ul>
  );
};
