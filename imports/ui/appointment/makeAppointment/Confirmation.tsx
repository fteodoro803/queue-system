import React from "react";
import { Service } from "/imports/api/service";
import { Provider } from "/imports/api/provider";

export const Confirmation = ({
  service,
  provider,
  dateTime,
}: {
  service: Service;
  provider: Provider | undefined;
  dateTime: Date;
}) => {
  return (
    <>
      <p>Confirmation:</p>
      <p>Service: {service.name}</p>
      <p>Provider: {provider?.name ?? "Any"}</p>
      <p>Date and Time: {dateTime.toLocaleString()}</p>
    </>
  );
};
