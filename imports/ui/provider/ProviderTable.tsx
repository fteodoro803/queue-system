import React, { useEffect, useState } from "react";
import { useFind, useSubscribe } from "meteor/react-meteor-data";
import { Avatar } from "/imports/ui/components/Avatar";
import { Loading } from "/imports/ui/components/Loading";
import { Provider, ProviderCollection } from "/imports/api/provider";
import { ProviderDetailsModal } from "/imports/ui/provider/ProviderDetailsModal";

export const ProviderTable = () => {
  const isLoading = useSubscribe("providers");
  const providers = useFind(() => ProviderCollection.find());
  const [isProviderDetailsModalOpen, setIsProviderDetailsModalOpen] =
    useState<boolean>(false);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(
    null,
  );

  // Sync selected provider when providers array updates
  useEffect(() => {
    if (selectedProvider) {
      const updated = providers.find((p) => p._id === selectedProvider._id);
      if (updated) {
        setSelectedProvider(updated);
      }
    }
  }, [providers]);

  const handleSelect = (provider: Provider) => {
    setSelectedProvider(provider);
    setIsProviderDetailsModalOpen(true);
  };

  // Loading
  if (isLoading()) {
    return <Loading />;
  }

  return (
    <div className="min-w-2xl max-w-7xl mx-auto px-8 py-8">
      <table className="table">
        {/* head */}
        <thead>
          <tr>
            <th></th>
            <th>Name</th>
            <th>Email</th>
            <th>Number</th>
          </tr>
        </thead>
        <tbody>
          {providers.map((p) => {
            const modalId: string = `my_modal_${p._id}`;
            return (
              <tr
                key={modalId}
                className="hover:bg-base-300"
                onClick={() => handleSelect(p)}
              >
                {/*Avatar*/}
                <th>
                  <Avatar profile={p} />
                </th>

                {/*Name*/}
                <td>{p.name}</td>

                {/*Email*/}
                <td>{p.email ? p.email : "-"}</td>

                {/*Number*/}
                <td>{p.number ? p.number : "-"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Provider Details Modal */}
      {selectedProvider && (
        <ProviderDetailsModal
          provider={selectedProvider}
          open={isProviderDetailsModalOpen}
          setOpen={setIsProviderDetailsModalOpen}
        />
      )}
    </div>
  );
};
