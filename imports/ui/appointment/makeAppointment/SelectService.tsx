import React from "react";
import { useTracker, useSubscribe } from "meteor/react-meteor-data";
import { Service, ServicesCollection } from "/imports/api/service";
import { Loading } from "/imports/ui/components/Loading";

export const SelectService = ({
  setService,
}: {
  setService: React.Dispatch<React.SetStateAction<Service | undefined>>;
}) => {
  // Get list of Services
  const isLoading = useSubscribe("services");
  const services = useTracker(() => ServicesCollection.find({}).fetch());

  if (isLoading()) {
    return <Loading />;
  }

  return (
    <div>
      <ul className="list bg-base-100 rounded-box shadow-md">
        <li className="p-4 pb-2 text-xs opacity-60 tracking-wide flex">
          Services
        </li>
        {services.map((s) => (
          <li
            className="list-row hover:bg-base-300"
            key={s._id}
            onClick={() => {
              setService(s);
            }}
          >
            <div></div>
            <div>
              <div>{s.name}</div>
              <div className="text-xs uppercase font-semibold opacity-60">
                {s.description}
              </div>
            </div>
            <p>from ₱{s.cost}</p>
            <p>{s.duration} minutes</p>
          </li>
        ))}
      </ul>
    </div>
  );
};
