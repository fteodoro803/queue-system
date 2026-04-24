import React from "react";
import { useFind, useSubscribe } from "meteor/react-meteor-data";
import { ProviderCollection } from "/imports/api/provider";
import { ProviderServicesTable } from "/imports/ui/provider/ProviderServicesTable";
import { CalendarIcon } from "@heroicons/react/24/outline";
import { Avatar } from "/imports/ui/components/Avatar";
import {
  toggleProviderActive,
  toggleProviderAvailability,
} from "/imports/api/providerMethods";

export const ProviderAvailabilityModal = ({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (value: boolean) => void;
}) => {
  const isLoading = useSubscribe("providers");
  const providers = useFind(() => ProviderCollection.find());

  const handleToggleAvailability = async (providerId: string) => {
    try {
      await toggleProviderAvailability(providerId);
    } catch (error) {
      console.error("Error toggling provider availability:", error);
    }
  };

  // TODO: if AtWork is off, automatically set Available off
  const handleToggleActive = async (providerId: string) => {
    try {
      await toggleProviderActive(providerId);
    } catch (error) {
      console.error("Error toggling provider at work status:", error);
    }
  };

  // Loading
  if (isLoading()) {
    return null;
  }

  // Closed
  if (!open) return null;

  return (
    <div className="modal modal-open" role="dialog">
      <div className="modal-box relative p-0 overflow-hidden max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 bg-base-200 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <CalendarIcon className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-lg leading-none">
              Provider Availability
            </h3>
            <p className="text-sm text-base-content/50 mt-0.5">
              View and manage provider services
            </p>
          </div>
          <button
            className="btn btn-circle btn-ghost btn-sm absolute top-3 right-3"
            onClick={() => setOpen(false)}
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 flex-1 overflow-y-auto">
          {providers.length === 0 ? (
            <div className="text-center py-8 text-base-content/50">
              <p>No providers available</p>
            </div>
          ) : (
            <div className="space-y-6">
              {providers.map((provider) => (
                <div
                  key={provider._id}
                  className="border border-base-300 rounded-lg overflow-hidden"
                >
                  {/* Provider Details Header */}
                  <div className="bg-base-100 px-4 py-3 border-b border-base-300 flex items-center gap-3">
                    <Avatar profile={provider} />
                    <div>
                      <h4 className="font-semibold text-base">
                        {provider.name}
                      </h4>
                      {provider.email && (
                        <p className="text-sm text-base-content/60">
                          {provider.email}
                        </p>
                      )}
                    </div>
                    {/* Active Toggle */}
                    <div className="flex items-center gap-2 ml-auto">
                      <p>Active</p>
                      <input
                        type="checkbox"
                        className="toggle toggle-success toggle-sm "
                        checked={provider.active}
                        onChange={() => handleToggleActive(provider._id)}
                      />
                    </div>

                    {/* Availability Toggle */}
                    <div className="flex items-center gap-2 ml-auto">
                      <p>Available</p>
                      <input
                        type="checkbox"
                        className="toggle toggle-success toggle-sm "
                        checked={provider.available}
                        onChange={() => handleToggleAvailability(provider._id)}
                      />
                    </div>
                  </div>

                  {/* Services Table */}
                  <div className="p-4">
                    <ProviderServicesTable provider={provider} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-base-100 border-t border-base-300 flex justify-end gap-3">
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => setOpen(false)}
          >
            Close
          </button>
        </div>
      </div>

      <div className="modal-backdrop" onClick={() => setOpen(false)} />
    </div>
  );
};
