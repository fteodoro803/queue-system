import React, { useEffect, useState } from "react";
import { Loading } from "/imports/ui/components/Loading";
import { useFind, useSubscribe } from "meteor/react-meteor-data";
import { Service, ServicesCollection } from "/imports/api/service";
// import { StatsCollection } from "/imports/api/stats";

export const Statistics = () => {
  const isServicesLoading = useSubscribe("services");
  const services = useFind(() =>
    ServicesCollection.find({}, { sort: { name: 1 } }),
  );
  const [selectedService, setSelectedService] = useState<Service | undefined>();

  const isStatsLoading = useSubscribe("stats");
  // const stats = useFind(() => StatsCollection.find());

  // const [timePeriod, setTimePeriod] = useState

  // ---- Effects ----
  // Select the first service by default when services are loaded
  useEffect(() => {
    if (services.length === 0) {
      setSelectedService(undefined);
      return;
    }

    setSelectedService((currentService) => {
      if (!currentService) return services[0];

      // Keep selection by id, but return the latest reactive object
      const updatedService = services.find(
        (service) => service._id === currentService._id,
      );
      return updatedService ?? services[0];
    });
  }, [services]);

  if (isServicesLoading() || isStatsLoading()) {
    return <Loading />;
  }

  return (
    <>
      <h1 className="text-3xl font-bold">Statistics</h1>

      <div className={"mt-4"}>
        <ServiceSelect
          services={services}
          setSelectedService={setSelectedService}
        />
      </div>
    </>
  );
};

const ServiceSelect = ({
  services,
  setSelectedService,
}: {
  services: Service[];
  setSelectedService: (value: Service | undefined) => void;
}) => {
  return (
    <fieldset className="fieldset">
      <legend className="fieldset-legend">
        Select a Service for more specific information
      </legend>
      <select defaultValue="Pick a service" className="select">
        <option onSelect={() => setSelectedService(undefined)}>None</option>
        {services.map((service) => (
          <option
            key={service._id}
            value={service._id}
            onSelect={() => setSelectedService(service)}
          >
            {service.name}
          </option>
        ))}
      </select>
      <span className="label">Optional</span>
    </fieldset>
  );
};
