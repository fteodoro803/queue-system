import React, { useState } from "react";
import { AddProviderModal } from "/imports/ui/provider/AddProviderModal";
import { ProviderTable } from "/imports/ui/provider/ProviderTable";

export const ProviderManagement = () => {
  const [addServiceProviderModalOpen, setAddServiceProviderModalOpen] =
    useState(false);

  return (
    <>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-4">
        <h1 className="text-3xl font-bold">Service Providers</h1>
        <button
          className="btn btn-primary w-full sm:w-auto"
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
