import React from "react";
import { Provider, ProviderService } from "/imports/api/provider";
import { useFind, useSubscribe } from "meteor/react-meteor-data";
import { Loading } from "../components/Loading";
import { Service, ServicesCollection } from "/imports/api/service";
import { updateProviderService } from "/imports/api/providerMethods";

export const ProviderServicesTable = ({ provider }: { provider: Provider }) => {
  const isLoadingProvider = useSubscribe("providers");
  const isLoadingServices = useSubscribe("services");
  const services = useFind(() => ServicesCollection.find());

  // Check if service is enabled for provider
  const isServiceEnabled = (serviceId: string): boolean => {
    return (
      provider.services?.some((s) => s.id === serviceId && s.enabled) ?? false
    );
  };

  // Toggles (enable/disable) service for provider
  const handleToggleService = async (service: Service) => {
    const toggleEnabled: boolean = !isServiceEnabled(service._id);
    const data: ProviderService = {
      id: service._id,
      name: service.name,
      enabled: toggleEnabled,
    };
    await updateProviderService(provider._id, data);
  };

  // Loading
  if (isLoadingProvider() || isLoadingServices()) {
    return <Loading />;
  }

  return (
    <div className="overflow-x-auto">
      <table className="table table-xs">
        {/* Head */}
        <thead>
          <tr>
            <th className="w-1/6 text-center">Name</th>
            <th className="w-1/6 text-center">Cost (PHP)</th>
            <th className="w-1/6 text-center">Enabled</th>
          </tr>
        </thead>
        <tbody>
          {services.map((service) => {
            const modalId: string = `my_modal_${service._id}}`;
            return (
              <tr key={modalId} className="hover:bg-base-300 text-center">
                {/* Name */}
                <td>{service.name}</td>

                {/* Cost */}
                <td>{service.cost ?? "-"}</td>

                {/* Toggle Button */}
                <td>
                  <input
                    type="checkbox"
                    className="toggle toggle-success toggle-xs"
                    checked={isServiceEnabled(service._id)}
                    onChange={() => handleToggleService(service)}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
