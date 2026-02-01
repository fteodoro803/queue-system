import React, { useState } from "react";
import { AddServiceModal } from "/imports/ui/service/AddServiceModal";
import { AddServiceProviderModal } from "/imports/ui/serviceProvider/AddServiceProviderModal";
import { ServiceProviderTable } from "/imports/ui/serviceProvider/ServiceProviderTable";
import { ServiceTable } from "/imports/ui/service/ServiceTable";

export const ServiceManagement = () => {
  const [addServiceProviderModalOpen, setAddServiceProviderModalOpen] =
    useState(false);
  const [addServiceModalOpen, setAddServiceModalOpen] = useState(false);

  return (
    <>
      <h1 className="text-3xl font-bold">Service Management</h1>
      <br />

      {/* Tabs for Services and Service Providers */}
      <div className="tabs tabs-lift flex justify-center">
        {/* Services */}
        <input
          type="radio"
          name="my_tabs_3"
          className="tab"
          aria-label="Services"
        />
        <div className="tab-content bg-base-100 border-base-300 p-6">
          {/*Services Table*/}
          <div className="flex justify-between">
            <h1 className="text-2xl font-bold">Services</h1>
            <button
              className="btn btn-primary"
              onClick={() => setAddServiceModalOpen(true)}
            >
              Add Service
            </button>
          </div>
          <ServiceTable />
        </div>

        {/* Service Providers */}
        <input
          type="radio"
          name="my_tabs_3"
          className="tab"
          aria-label="Providers"
          defaultChecked
        />
        <div className="tab-content bg-base-100 border-base-300 p-6">
          {/* Service Providers */}
          <div className="flex justify-between">
            <h1 className="text-2xl font-bold">Service Providers</h1>
            <button
              className="btn btn-primary"
              onClick={() => setAddServiceProviderModalOpen(true)}
            >
              Add Provider
            </button>
          </div>

          <ServiceProviderTable />
        </div>
      </div>

      {/* Modals */}
      {/*<AddServiceModal/>*/}
      <AddServiceModal
        open={addServiceModalOpen}
        setOpen={setAddServiceModalOpen}
      />
      <AddServiceProviderModal
        open={addServiceProviderModalOpen}
        setOpen={setAddServiceProviderModalOpen}
      />
    </>
  );
};
