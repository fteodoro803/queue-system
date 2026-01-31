import React, { useState } from "react";
import { useFind, useSubscribe } from "meteor/react-meteor-data";
import { Avatar } from "/imports/ui/components/Avatar";
import { Loading } from "/imports/ui/components/Loading";
import { ServiceProvider, ServiceProviderCollection } from "/imports/api/serviceProvider";
import { EllipsisVerticalIcon } from "@heroicons/react/24/outline";

export const ServiceProviderTable = () => {
  const isLoading = useSubscribe("serviceProviders");
  const serviceProviders = useFind(() => ServiceProviderCollection.find());
  const [isProviderDetailsModalOpen, setIsProviderDetailsModalOpen] = useState<boolean>(false);
  const [selectedProvider, setSelectedProvider] = useState<ServiceProvider>(null);

  // Loading
  if (isLoading()) {
    return (
      <Loading/>
    );
  }

  return (
    <div className="min-w-2xl max-w-7xl mx-auto px-8 py-8">
      <table className="table">
        {/* head */}
        <thead>
        <tr>
          <th></th>
          <th>Name</th>
          <th>Email</th>
          <th>Number</th>
          <th>Actions</th>
        </tr>
        </thead>
        <tbody>
        {
          serviceProviders.map((p) => {
            const modalId: string = `my_modal_${p._id}}`;
            return (
              <tr key={modalId} className="hover:bg-base-300">

                {/*Avatar*/}
                <th>
                  <Avatar profile={p}/>

                </th>

                {/*Name*/}
                <td>{p.name}</td>

                {/*Email*/}
                <td>{(p.email) ? p.email : "-"}</td>

                {/*Number*/}
                <td>{(p.number) ? p.number : "-"}</td>

                {/*Edit Modal*/}
                <td>
                  <button className="btn btn-circle btn-ghost"
                          onClick={() => {
                            setSelectedProvider(p);
                            setIsProviderDetailsModalOpen(true);
                          }}>
                    <EllipsisVerticalIcon className="h-5 w-5"/>
                  </button>
                </td>
              </tr>
            );
          })
        }
        </tbody>
      </table>

      {/*<ServiceProviderDetailsModal patient={selectedProvider}*/}
      {/*                     open={isProviderDetailsModalOpen}*/}
      {/*                     setOpen={setIsProviderDetailsModalOpen}/>*/}

    </div>
  );

};