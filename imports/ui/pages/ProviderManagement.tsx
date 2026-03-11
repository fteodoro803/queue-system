import React, { useState } from "react";
import { AddProviderModal } from "../provider/AddProviderModal";
import { ProviderTable } from "../provider/ProviderTable";

export const ProviderManagement = () => {
  const [addServiceProviderModalOpen, setAddServiceProviderModalOpen] =
    useState(false);

  return (
    <>
      <div className="flex justify-between">
        <h1 className="text-3xl font-bold">Service Providers</h1>
        <button
          className="btn btn-primary"
          onClick={() => setAddServiceProviderModalOpen(true)}
        >
          + New Provider
        </button>
      </div>

      <ProviderTable />

      {/* Modal */}
      <AddProviderModal
        open={addServiceProviderModalOpen}
        setOpen={setAddServiceProviderModalOpen}
      />
    </>
  );
};
