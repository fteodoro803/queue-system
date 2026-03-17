import React, { useState } from "react";
import { AddServiceModal } from "/imports/ui/service/AddServiceModal";
import { ServiceTable } from "/imports/ui/service/ServiceTable";
import { clearServiceAnalytics } from "/imports/api/serviceMethods";

export const ServiceManagement = () => {
  const [addServiceModalOpen, setAddServiceModalOpen] = useState(false);

  return (
    <>
      {/*Services Table*/}
      <div className="flex justify-between">
        <h1 className="text-3xl font-bold">Services</h1>
        <div className="flex gap-1">
          {/* <button
            className="btn btn-primary"
            onClick={() => clearServiceAnalytics()}
          >
            - Clear Analytics
          </button> */}
          <button
            className="btn btn-primary"
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
