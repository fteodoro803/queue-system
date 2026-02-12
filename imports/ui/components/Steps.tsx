import React from "react";

interface StepsProps {
  step: number;
}

export const Steps = ({ step }: StepsProps) => {
  return (
    <ul className="steps">
      {/* Highlight step if current step is equal or higher */}
      <li className={`step ${step >= 1 ? "step-accent" : ""}`}>Service</li>
      <li className={`step ${step >= 2 ? "step-accent" : ""}`}>Provider</li>
      <li className={`step ${step >= 3 ? "step-accent" : ""}`}>Date</li>
      <li className={`step ${step >= 4 ? "step-accent" : ""}`}>Confirm</li>
    </ul>
  );
};
