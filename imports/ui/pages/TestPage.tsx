import React, { useState } from "react";
import { GenericField } from "../components/GenericField";
import { EmailField } from "../components/EmailField";
import { NumberField } from "../components/NumberField";
import { Calendar } from "../components/Calendar";

export const TestPage = () => {
  const [genericFieldValue, setGenericFieldValue] = useState<string>("");
  const [emailFieldValue, setEmailFieldValue] = useState<string>("");
  const [numberFieldValue, setNumberFieldValue] = useState<string>("");

  const [date, setDate] = useState<Date | undefined>(undefined);

  return (
    <>
      <h1 className="text-3xl font-bold">Test Page</h1>

      {/* Theme Section */}
      <div className="mt-4">
        <h1 className="text-xl font-semibold">Theme</h1>
        <div className="flex gap-2">
          <button className="btn btn-primary">Primary</button>
          <button className="btn btn-secondary">Secondary</button>
          <button className="btn btn-accent">Accent</button>
        </div>
      </div>

      {/* Field Section */}
      <div className="mt-4">
        <h1 className="text-xl font-semibold">Generic Field</h1>
        <GenericField
          value={genericFieldValue}
          onChange={setGenericFieldValue}
          mode="write"
        />
        <GenericField
          value={genericFieldValue}
          onChange={setGenericFieldValue}
          mode="read"
        />
        <GenericField
          value={genericFieldValue}
          onChange={setGenericFieldValue}
          mode="editable"
        />
        <EmailField
          value={emailFieldValue}
          onChange={setEmailFieldValue}
          mode="write"
        />
        <NumberField
          value={numberFieldValue}
          onChange={setNumberFieldValue}
          mode="write"
        />
      </div>

      {/* Calendar Section */}
      <div className="mt-4">
        <h1 className="text-xl font-semibold">Calendar</h1>
        <Calendar date={date} setDate={setDate} />
      </div>
    </>
  );
};
