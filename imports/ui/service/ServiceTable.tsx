import React, { useState } from "react";
import { useFind, useSubscribe } from "meteor/react-meteor-data";
import { Loading } from "/imports/ui/components/Loading";
import { Service, ServicesCollection } from "/imports/api/service";
import { EllipsisVerticalIcon } from "@heroicons/react/24/outline";

export const ServiceTable = () => {
  const isLoading = useSubscribe("services");
  const services = useFind(() => ServicesCollection.find());
  const [isServiceDetailsModalOpen, setIsServiceDetailsModalOpen] =
    useState<boolean>(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);

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
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {services.map((s) => {
            const modalId: string = `my_modal_${s._id}}`;
            return (
              <tr key={modalId} className="hover:bg-base-300">
                {/*Name*/}
                <td>{s.name}</td>

                {/*Duration*/}
                <td>{s.duration ? s.duration : "-"}</td>

                {/*Cost*/}
                <td>{s.cost ? s.cost : "-"}</td>

                {/*Edit Modal*/}
                <td>
                  <button
                    className="btn btn-circle btn-ghost"
                    onClick={() => {
                      setSelectedService(s);
                      setIsServiceDetailsModalOpen(true);
                    }}
                  >
                    <EllipsisVerticalIcon className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/*<ServiceProviderDetailsModal patient={selectedProvider}*/}
      {/*                     open={isProviderDetailsModalOpen}*/}
      {/*                     setOpen={setIsProviderDetailsModalOpen}/>*/}
    </div>
  );
};
