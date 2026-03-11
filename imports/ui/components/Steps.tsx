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
