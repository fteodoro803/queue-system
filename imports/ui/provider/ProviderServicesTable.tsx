import React from "react";
import { Provider, ProviderService } from "/imports/api/provider";
import { useFind, useSubscribe } from "meteor/react-meteor-data";
import { Loading } from "/imports/ui/components/Loading";
import { Service, ServicesCollection } from "/imports/api/service";
import { updateProviderService } from "/imports/api/providerMethods";

export const ProviderServicesTable = ({
  provider,
  displayCost,
}: {
  provider: Provider;
  displayCost?: boolean;
}) => {
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

  // Availability modal does not show cost, so use a roomier table there.
  const isSimple = !displayCost;

  return (
    <div
      className={`overflow-x-auto ${isSimple ? "rounded-lg border border-base-300" : ""}`}
    >
      <table
        className={isSimple ? "table table-sm table-fixed" : "table table-xs"}
      >
        {/* Head */}
        <thead className={isSimple ? "bg-base-200/60" : ""}>
          <tr>
            <th className={isSimple ? "text-center pl-4" : "w-1/6 text-center"}>
              {isSimple ? "Service" : "Name"}
            </th>
            {displayCost && (
              <th className={isSimple ? "text-right" : "w-1/6 text-center"}>
                Cost (PHP)
              </th>
            )}
            <th className={isSimple ? "w-20 text-center" : "w-1/6 text-center"}>
              Enabled
            </th>
          </tr>
        </thead>
        <tbody>
          {services.map((service) => {
            return (
              <tr
                key={service._id}
                className={
                  isSimple
                    ? "hover:bg-base-200/60"
                    : "hover:bg-base-300 text-center"
                }
                onClick={() => handleToggleService(service)}
              >
                {/* Name */}
                <td className={isSimple ? "font-medium pl-4 text-center" : ""}>
                  {service.name}
                </td>

                {/* Cost */}
                {displayCost && (
                  <td className={isSimple ? "text-right" : ""}>
                    {service.cost ?? "-"}
                  </td>
                )}

                {/* Toggle Button */}
                <td className={isSimple ? "text-center w-20" : ""}>
                  <input
                    type="checkbox"
                    className={`toggle toggle-success ${isSimple ? "toggle-sm" : "toggle-xs"}`}
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
