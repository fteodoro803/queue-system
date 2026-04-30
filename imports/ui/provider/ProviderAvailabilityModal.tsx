import React, { useEffect, useMemo, useState } from "react";
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
  const [selectedProviderId, setSelectedProviderId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    if (providers.length === 0) {
      setSelectedProviderId(null);
      return;
    }

    const hasSelected = providers.some((p) => p._id === selectedProviderId);
    if (!hasSelected) {
      setSelectedProviderId(providers[0]._id);
    }
  }, [providers, selectedProviderId]);

  const selectedProvider = useMemo(
    () => providers.find((p) => p._id === selectedProviderId),
    [providers, selectedProviderId],
  );

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
        <div className="px-6 py-5 flex-1 overflow-hidden">
          {providers.length === 0 ? (
            <div className="text-center py-8 text-base-content/50">
              <p>No providers available</p>
            </div>
          ) : (
            <div className="grid h-full gap-4 md:grid-cols-[320px_minmax(0,1fr)]">
              <div className="rounded-lg border border-base-300 bg-base-100 overflow-hidden flex flex-col min-h-0">
                <div className="px-4 py-3 border-b border-base-300 bg-base-200/40">
                  <h4 className="font-semibold">Providers</h4>
                  <p className="text-xs text-base-content/60 mt-0.5">
                    Select a provider to manage service availability.
                  </p>
                </div>

                <div className="overflow-y-auto divide-y divide-base-300 min-h-0">
                  {providers.map((provider) => {
                    const isSelected = provider._id === selectedProviderId;
                    return (
                      <div
                        key={provider._id}
                        className={`p-3 cursor-pointer transition-colors ${
                          isSelected
                            ? "bg-primary/10 ring-1 ring-inset ring-primary/30"
                            : "hover:bg-base-200/60"
                        }`}
                        onClick={() => setSelectedProviderId(provider._id)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            setSelectedProviderId(provider._id);
                          }
                        }}
                      >
                        <div className="flex items-start gap-3">
                          <Avatar profile={provider} />
                          <div className="min-w-0">
                            <p className="font-medium truncate">{provider.name}</p>
                            {provider.email && (
                              <p className="text-xs text-base-content/60 truncate">
                                {provider.email}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="mt-3 flex items-center gap-4 text-xs">
                          <label
                            className="flex items-center gap-2"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <span className="opacity-70">Active</span>
                            <input
                              type="checkbox"
                              className="toggle toggle-success toggle-sm"
                              checked={provider.active}
                              onChange={() => handleToggleActive(provider._id)}
                            />
                          </label>

                          <label
                            className="flex items-center gap-2"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <span className="opacity-70">Available</span>
                            <input
                              type="checkbox"
                              className="toggle toggle-success toggle-sm"
                              checked={provider.available}
                              onChange={() =>
                                handleToggleAvailability(provider._id)
                              }
                            />
                          </label>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-lg border border-base-300 bg-base-100 overflow-hidden flex flex-col min-h-0">
                {selectedProvider ? (
                  <>
                    <div className="px-4 py-3 border-b border-base-300 bg-base-200/40 flex items-center justify-between gap-3">
                      <div>
                        <h4 className="font-semibold">{selectedProvider.name}</h4>
                        <p className="text-xs text-base-content/60 mt-0.5">
                          Enable or disable services for this provider.
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs shrink-0">
                        <span
                          className={`badge badge-sm w-24 justify-center ${
                            selectedProvider.active
                              ? "badge-success"
                              : "badge-ghost"
                          }`}
                        >
                          {selectedProvider.active ? "Active" : "Inactive"}
                        </span>
                        <span
                          className={`badge badge-sm w-24 justify-center ${
                            selectedProvider.available
                              ? "badge-info"
                              : "badge-ghost"
                          }`}
                        >
                          {selectedProvider.available
                            ? "Available"
                            : "Unavailable"}
                        </span>
                      </div>
                    </div>

                    <div className="p-4 overflow-y-auto min-h-0">
                      <ProviderServicesTable provider={selectedProvider} />
                    </div>
                  </>
                ) : (
                  <div className="h-full flex items-center justify-center text-sm text-base-content/60 px-4 text-center">
                    Select a provider from the list to manage services.
                  </div>
                )}
              </div>
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
