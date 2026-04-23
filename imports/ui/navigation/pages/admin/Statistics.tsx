import React, { useState } from "react";
import { Loading } from "/imports/ui/components/Loading";
import { useFind, useSubscribe } from "meteor/react-meteor-data";
import { Service, ServicesCollection } from "/imports/api/service";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { StatsCollection } from "/imports/api/stats";
import { getAverageServiceTime } from "/imports/utils/statsUtils";
import { AxisDomain } from "recharts/types/util/types";

export const Statistics = () => {
  const isServicesLoading = useSubscribe("services");
  const services = useFind(() =>
    ServicesCollection.find({}, { sort: { name: 1 } }),
  );
  const [selectedService, setSelectedService] = useState<Service | undefined>();

  const isStatsLoading = useSubscribe("stats");
  const stats = useFind(() => StatsCollection.find());

  // const [timePeriod, setTimePeriod] = useState

  if (isServicesLoading() || isStatsLoading()) {
    return <Loading />;
  }

  const avgWaitTimes = getAverageServiceTime(stats, selectedService);
  return (
    <>
      <h1 className="text-3xl font-bold">Statistics</h1>

      <div className={"mt-4"}>
        <ServiceSelect
          services={services}
          setSelectedService={setSelectedService}
        />
      </div>

      <ServiceTimeChart data={avgWaitTimes} />
    </>
  );
};

const ServiceSelect = ({
  services,
  setSelectedService,
}: {
  services: Service[];
  setSelectedService: (value: Service | undefined) => void;
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    if (!selectedId) {
      setSelectedService(undefined);
      return;
    }
    const service = services.find((s) => s._id === selectedId);
    setSelectedService(service);
  };

  return (
    <fieldset className="fieldset">
      <legend className="fieldset-legend">
        Select a Service for more specific information
      </legend>
      <select defaultValue="" className="select" onChange={handleChange}>
        <option value="">None</option>
        {services.map((service) => (
          <option key={service._id} value={service._id}>
            {service.name}
          </option>
        ))}
      </select>
      <span className="label">Optional</span>
    </fieldset>
  );
};

export const ServiceTimeChart = ({
  data,
  maxX,
  maxY,
}: {
  data: { date: Date; avgWaitTime: number }[];
  maxX?: number;
  maxY?: number;
}) => {
  const xDomain: AxisDomain = maxX ? [0, maxX] : [0, "auto"];
  const yDomain: AxisDomain = maxY ? [0, maxY] : [0, "auto"];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="date"
          tickFormatter={(date: Date) =>
            date.toLocaleDateString(undefined, { dateStyle: "short" })
          }
          domain={xDomain}
        />
        <YAxis
          domain={yDomain}
          label={{ value: "mins", angle: -90, position: "insideLeft" }}
        />
        <Tooltip />
        <Line
          type="monotone"
          dataKey="avgWaitTime"
          stroke="#8884d8"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};
