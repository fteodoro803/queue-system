import React from "react";

interface StepsProps {
  currentStep: number;
  steps: Record<number, string>;
}

export const Steps = ({ currentStep, steps }: StepsProps) => {
  const stepColour = "step-primary";
  const text = "font-bold";

  return (
    <ul className="steps steps-secondary">
      {/* Highlight step if current step is equal or higher */}
      {/* <li
        className={`step ${step >= 1 ? stepColour : ""} ${text}`}
      >
        Service
      </li>
      <li
        className={`step ${step >= 2 ? stepColour : ""} ${text}`}
      >
        Provider
      </li>
      <li
        className={`step ${step >= 3 ? stepColour : ""} ${text}`}
      >
        Date
      </li>
      <li
        className={`step ${step >= 4 ? stepColour : ""} ${text}`}
      >
        Patient
      </li>
      <li
        className={`step ${step >= 5 ? stepColour : ""} ${text}`}
      >
        Confirm
      </li> */}

      {Object.entries(steps).map(([stepNumber, stepName]) => (
        <li
          key={stepNumber}
          className={`step ${currentStep >= Number(stepNumber) ? stepColour : ""} ${text}`}
        >
          {stepName}
        </li>
      ))}
    </ul>
  );
};
