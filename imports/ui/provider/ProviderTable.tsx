import React, { useEffect, useState } from "react";
import { useFind, useSubscribe } from "meteor/react-meteor-data";
import { Avatar } from "/imports/ui/components/Avatar";
import { Loading } from "/imports/ui/components/Loading";
import { Provider, ProviderCollection } from "/imports/api/provider";
import { ProviderDetailsModal } from "/imports/ui/provider/ProviderDetailsModal";
import { styles } from "/imports/utils/styles";
import { formatNumberDisplay } from "/imports/utils/numberUtils";

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
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
      <div className="overflow-x-auto rounded-xl">
        <table
          className={`table w-full min-w-136 sm:min-w-160 ${styles.outline} rounded-xl overflow-hidden [&_th]:px-2 [&_td]:px-2 sm:[&_th]:px-4 sm:[&_td]:px-4 [&_th]:py-4 [&_td]:py-4`}
        >
          {/* head */}
          <thead className="bg-base-300 text-xs sm:text-sm">
            <tr>
              <th className="text-center"></th>
              <th className="text-center">Name</th>
              <th className="text-center">Email</th>
              <th className="text-center">Number</th>
            </tr>
          </thead>
          <tbody>
            {providers.map((p) => {
              const modalId: string = `my_modal_${p._id}`;
              return (
                <tr
                  key={modalId}
                  className="bg-base-100 hover:bg-base-300 cursor-pointer"
                  onClick={() => handleSelect(p)}
                >
                  {/*Avatar*/}
                  <th className="w-14 text-center align-middle">
                    <Avatar profile={p} />
                  </th>

                  {/*Name*/}
                  <td className="max-w-48 text-center truncate" title={p.name}>
                    {p.name}
                  </td>

                  {/*Email*/}
                  <td
                    className="max-w-64 text-center truncate"
                    title={p.email ?? "-"}
                  >
                    {p.email ? p.email : "-"}
                  </td>

                  {/*Number*/}
                  <td className="whitespace-nowrap text-center tabular-nums">
                    {p.number ? formatNumberDisplay(p.number) : "-"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

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
