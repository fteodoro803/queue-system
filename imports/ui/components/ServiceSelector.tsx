// Buttons to select a Service
import { Service } from "/imports/api/service";
import React, { Dispatch, SetStateAction } from "react";

export const ServiceSelector = ({
  services,
  selectedService,
  setService,
}: {
  services: Service[];
  selectedService?: Service;
  setService: Dispatch<SetStateAction<Service | undefined>>;
}) => {
  return (
    <div className="flex flex-wrap gap-2">
      {services.length === 0 ? (
        <span className="text-base-content/50">No services available</span>
      ) : (
        services.map((service) => (
          <button
            key={service._id}
            className={`btn ${selectedService?._id === service._id ? "btn-primary" : "btn-outline"}`}
            onClick={() => setService(service)}
          >
            {service.name}
          </button>
        ))
      )}
    </div>
  );
};
