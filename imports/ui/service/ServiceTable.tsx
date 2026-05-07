import React, { useEffect, useState } from "react";
import { useFind, useSubscribe } from "meteor/react-meteor-data";
import { Loading } from "/imports/ui/components/Loading";
import { Service, ServicesCollection } from "/imports/api/service";
import { ServiceDetailsModal } from "/imports/ui/service/ServiceDetailsModal";
import { styles } from "/imports/utils/styles";

export const ServiceTable = () => {
  const isLoading = useSubscribe("services");
  const services = useFind(() => ServicesCollection.find());
  const [isServiceDetailsModalOpen, setIsServiceDetailsModalOpen] =
    useState<boolean>(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  // Sync selected service when services array updates
  useEffect(() => {
    if (selectedService) {
      const updated = services.find((s) => s._id === selectedService._id);
      if (updated) {
        setSelectedService(updated);
      }
    }
  }, [services]);

  const handleSelect = (service: Service) => {
    setSelectedService(service);
    setIsServiceDetailsModalOpen(true);
  };

  // Loading
  if (isLoading()) {
    return <Loading />;
  }

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
      <div className="overflow-x-auto rounded-xl">
        <table
          className={`table w-full min-w-xl ${styles.outline} rounded-xl overflow-hidden`}
        >
          {/* head */}
          <thead className="bg-base-300 text-xs sm:text-sm">
            <tr>
              <th>Name</th>
              <th>Duration (mins)</th>
              <th>Cost (PHP)</th>
            </tr>
          </thead>
          <tbody>
            {services.map((s) => {
              const modalId: string = `my_modal_${s._id}`;
              const serviceName = `${s.name} (${s.shortcode})`;
              return (
                <tr
                  key={modalId}
                  className="bg-base-100 hover:bg-base-300 cursor-pointer"
                  onClick={() => handleSelect(s)}
                >
                  {/*Name*/}
                  <td className="max-w-72 truncate" title={serviceName}>
                    {serviceName}
                  </td>

                  {/*Duration*/}
                  <td className="whitespace-nowrap">{s.duration ? s.duration : "-"}</td>

                  {/*Cost*/}
                  <td className="whitespace-nowrap">{s.cost ? s.cost : "-"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {selectedService && (
        <ServiceDetailsModal
          service={selectedService}
          open={isServiceDetailsModalOpen}
          setOpen={setIsServiceDetailsModalOpen}
        />
      )}
    </div>
  );
};
