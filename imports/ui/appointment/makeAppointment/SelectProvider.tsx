import { useSubscribe, useTracker } from "meteor/react-meteor-data";
import React, { useEffect, useState } from "react";
import { Provider, ProviderCollection } from "/imports/api/provider";
import { Loading } from "../../components/Loading";
import { Avatar } from "../../components/Avatar";
import { Service } from "/imports/api/service";
import { getEarliestAppointment } from "/imports/api/appointmentMethods";

export const SelectProvider = ({
  setProvider,
  service,
}: {
  setProvider: React.Dispatch<React.SetStateAction<Provider | undefined>>;
  service: Service | undefined;
}) => {
  const isLoading = useSubscribe("providers");

  // Gets Providers, filtering by service and if it's enabled
  const providers = useTracker(() =>
    ProviderCollection.find({
      services: {
        $elemMatch: {
          id: service?._id,
          enabled: true,
        },
      },
    }).fetch(),
  );
  // Stable string to use as useEffect dependency
  const providerIds: string = providers.map((p) => p._id).join(",");

  // Get earliest Provider-specific availabilities for the service
  const [earliestProviderRecord, setEarliestProviderRecord] = useState<
    Record<string, Date | undefined>
  >({});
  useEffect(() => {
    if (!service || providers.length === 0) return;

    for (const provider of providers) {
      getEarliestAppointment(service._id, provider._id).then((date) => {
        setEarliestProviderRecord((prev) => ({
          ...prev,
          [provider._id]: date,
        }));
      });
    }
  }, [service, providerIds]);

  if (!service)
    return <p className="text-2xl text-red-500">Select a Service first</p>;

  if (isLoading()) {
    return <Loading />;
  }

  return (
    <div>
      <ul className="list bg-base-100 rounded-box shadow-md">
        <li className="p-4 pb-2 text-xs opacity-60 tracking-wide">Providers</li>
        {/* Any */}
        <li
          className="list-row hover:bg-base-300"
          onClick={() => {
            setProvider(undefined);
          }}
        >
          <div>
            <Avatar profile={undefined} />
          </div>
          <div>
            <div>Any</div>
            <div className="text-xs uppercase font-semibold opacity-60">
              Maximum availability
            </div>
          </div>
        </li>
        {/* Filtered Providers */}
        {providers.map((p) => (
          <li
            className="list-row hover:bg-base-300"
            key={p._id}
            onClick={() => {
              setProvider(p);
            }}
          >
            <div>
              <Avatar profile={p} />
            </div>
            <div>
              <div>{p.name}</div>
              <div className="text-xs uppercase font-semibold opacity-60">
                {earliestProviderRecord[p._id] != undefined
                  ? `${earliestProviderRecord[p._id]?.toLocaleDateString()} at ${earliestProviderRecord[p._id]?.toLocaleTimeString()}`
                  : "N/A"}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
