import React from "react";
import { Provider, ProviderService } from "/imports/api/provider";
import { useFind, useSubscribe } from "meteor/react-meteor-data";
import { Loading } from "../components/Loading";
import { Service, ServicesCollection } from "/imports/api/service";
import { updateProviderService } from "/imports/api/providerMethods";

export const ProviderServices = ({ provider }: { provider: Provider }) => {
  const isLoadingProvider = useSubscribe("providers");
  const isLoadingServices = useSubscribe("services");
  const services = useFind(() => ServicesCollection.find());

  // Saves/Removes service from provider's list of services
  const handleToggleService = async (
    checked: React.ChangeEvent<HTMLInputElement>,
    service: Service,
  ) => {
    let providerService: ProviderService = {
      id: service._id,
      name: service.name,
      enabled: checked.target.checked,
    };
    updateProviderService(provider._id, providerService);
  };

  const [toggledServices, setToggledServices] = React.useState<
    ProviderService[]
  >(provider.services);

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
            <th className="w-3/6">Name</th>
            <th className="w-2/6">Cost (PHP)</th>
            <th className="w-1/6">Enabled</th>
          </tr>
        </thead>
        <tbody>
          {services.map((service) => {
            const modalId: string = `my_modal_${service._id}}`;
            return (
              <tr key={modalId} className="hover:bg-base-300">
                {/* Name */}
                <td>{service.name}</td>

                {/* Cost */}
                <td>{service.cost ? service.cost : "-"}</td>

                {/* Toggle Button */}
                <td>
                  <input
                    type="checkbox"
                    className="toggle toggle-success toggle-xs"
                    onChange={(e) => handleToggleService(e, service)}
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
