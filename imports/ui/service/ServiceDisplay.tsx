import React from "react";
import { useTracker, useSubscribe } from "meteor/react-meteor-data";
import { ServicesCollection } from "/imports/api/service";
import { Loading } from "/imports/ui/components/Loading";

export const ServiceDetails = () => {
  // Get list of Services
  const isLoading = useSubscribe("services");
  const services = useTracker(() => ServicesCollection.find({}).fetch());

  function addButtonValue(cost?: number | null): string {
    if (!cost) {
      return "Add";
    }

    return `₱${cost}`;
  }

  if (isLoading()) {
    return <Loading />;
  }

  return (
    <div>
      {services.map((s) => (
        <div className="card w-96 bg-base-100 card-sm shadow-sm">
          <div className="card-body">
            <h2 className="card-title">{s.name}</h2>
            <p>{s.description ?? "No description available."}</p>
            <div className="justify-end card-actions">
              <button className="btn btn-primary">
                {addButtonValue(s.cost)}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
