import React, { useState } from "react";
import { AddServiceModal } from "/imports/ui/service/AddServiceModal";
import { ServiceTable } from "/imports/ui/service/ServiceTable";

export const ServiceManagement = () => {
  const [addServiceModalOpen, setAddServiceModalOpen] = useState(false);

  return (
    <>
      {/*Services Table*/}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-4">
        <h1 className="text-3xl font-bold">Services</h1>
        <div className="flex gap-1">
          <button
            className="btn btn-primary w-full sm:w-auto"
            onClick={() => setAddServiceModalOpen(true)}
          >
            + New Service
          </button>
        </div>
      </div>
      <ServiceTable />

      {/* Modal */}
      <AddServiceModal
        open={addServiceModalOpen}
        setOpen={setAddServiceModalOpen}
      />
    </>
  );
};
