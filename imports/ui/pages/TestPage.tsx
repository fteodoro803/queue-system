import React from "react";
import { GenericField } from "../components/GenericField";

export const TestPage = () => {
  const [genericFieldValue, setGenericFieldValue] = React.useState<string>("");

  return (
    <>
      <h1 className="text-3xl font-bold">Test Page</h1>

      <h1 className="text-xl font-semibold">Generic Field</h1>
      <GenericField value={genericFieldValue} onChange={setGenericFieldValue} mode="write"/>
      <GenericField value={genericFieldValue} onChange={setGenericFieldValue} mode="read"/>
      <GenericField value={genericFieldValue} onChange={setGenericFieldValue} mode="editable"/>
    </>
  );
};
