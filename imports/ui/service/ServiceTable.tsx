import React, { useEffect, useState } from "react";
import { useFind, useSubscribe } from "meteor/react-meteor-data";
import { Loading } from "/imports/ui/components/Loading";
import { Service, ServicesCollection } from "/imports/api/service";
import { ServiceDetailsModal } from "/imports/ui/service/ServiceDetailsModal";

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
    <div className="min-w-2xl max-w-7xl mx-auto px-8 py-8">
      <table className="table">
        {/* head */}
        <thead>
          <tr>
            <th>Name</th>
            <th>Duration (mins)</th>
            <th>Cost (PHP)</th>
          </tr>
        </thead>
        <tbody>
          {services.map((s) => {
            const modalId: string = `my_modal_${s._id}`;
            return (
              <tr
                key={modalId}
                className="hover:bg-base-300"
                onClick={() => handleSelect(s)}
              >
                {/*Name*/}
                <td>
                  {s.name} ({s.shortcode})
                </td>

                {/*Duration*/}
                <td>{s.duration ? s.duration : "-"}</td>

                {/*Cost*/}
                <td>{s.cost ? s.cost : "-"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

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
