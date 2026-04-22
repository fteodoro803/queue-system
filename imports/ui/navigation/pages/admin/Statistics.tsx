import React, { useEffect, useState } from "react";
import { Loading } from "/imports/ui/components/Loading";
import { useFind, useSubscribe } from "meteor/react-meteor-data";
import { Service, ServicesCollection } from "/imports/api/service";
import { ServiceSelector } from "/imports/ui/components/ServiceSelector";
// import { StatsCollection } from "/imports/api/stats";

export const Statistics = () => {
  const isServicesLoading = useSubscribe("services");
  const services = useFind(() => ServicesCollection.find());
  const [selectedService, setSelectedService] = useState<Service | undefined>();

  const isStatsLoading = useSubscribe("stats");
  // const stats = useFind(() => StatsCollection.find());

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
        <ServiceSelector
          services={services}
          selectedService={selectedService}
          setService={setSelectedService}
        />
      </div>
    </>
  );
};
