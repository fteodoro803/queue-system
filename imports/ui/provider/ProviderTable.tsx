import React, { useState } from "react";
import { useFind, useSubscribe } from "meteor/react-meteor-data";
import { Avatar } from "/imports/ui/components/Avatar";
import { Loading } from "/imports/ui/components/Loading";
import { Provider, ProviderCollection } from "../../api/provider";
import { EllipsisVerticalIcon } from "@heroicons/react/24/outline";
import { ProviderDetailsModal } from "./ProviderDetailsModal";

export const ProviderTable = () => {
  const isLoading = useSubscribe("providers");
  const providers = useFind(() => ProviderCollection.find());
  const [isProviderDetailsModalOpen, setIsProviderDetailsModalOpen] =
    useState<boolean>(false);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(
    null,
  );

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
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {providers.map((p) => {
            const modalId: string = `my_modal_${p._id}}`;
            return (
              <tr key={modalId} className="hover:bg-base-300">
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

                {/*Edit Modal*/}
                <td>
                  <button
                    className="btn btn-circle btn-ghost"
                    onClick={() => {
                      setSelectedProvider(p);
                      setIsProviderDetailsModalOpen(true);
                    }}
                  >
                    <EllipsisVerticalIcon className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Modal */}
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
