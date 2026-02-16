import React from "react";
import { GenericField } from "../components/GenericField";
import { EmailField } from "../components/EmailField";
import { NumberField } from "../components/NumberField";

export const TestPage = () => {
  const [genericFieldValue, setGenericFieldValue] = React.useState<string>("");
  const [emailFieldValue, setEmailFieldValue] = React.useState<string>("");
  const [numberFieldValue, setNumberFieldValue] = React.useState<string>("");

  return (
    <>
      <h1 className="text-3xl font-bold">Test Page</h1>

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
    </>
  );
};
