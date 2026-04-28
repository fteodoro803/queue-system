import React, { useState } from "react";
import { Loading } from "/imports/ui/components/Loading";
import { useFind, useSubscribe } from "meteor/react-meteor-data";
import { Service, ServicesCollection } from "/imports/api/service";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { StatsCollection } from "/imports/api/stats";
import {
  getAverageServiceTime,
  getQueueCount,
  getWaitTimeDifference,
} from "/imports/utils/statsUtils";
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

  const queueCount = getQueueCount(stats, selectedService);
  const averageServiceTime = getAverageServiceTime(stats, selectedService);
  const waitTimeDifference = getWaitTimeDifference(stats, selectedService);

  return (
    <>
      <h1 className="text-3xl font-bold">Statistics</h1>

      <div className={"mt-4"}>
        <ServiceSelect
          services={services}
          setSelectedService={setSelectedService}
        />
      </div>

      {/*Daily Queue Entries*/}
      <div>
        <h2 className="text-2xl font-bold mt-2">Daily Queue Entries</h2>
        <QueueCountChart data={queueCount} />
      </div>

      {/*Average Service Time*/}
      <div>
        <h2 className="text-2xl font-bold mt-2">Average Service Time</h2>
        <p className="text-sm text-base-content/60 mb-2">
          Red dashed line is the listed service time.
        </p>
        <ServiceTimeChart
          data={averageServiceTime}
          serviceDuration={selectedService?.duration}
        />
      </div>

      {/*Wait Time Difference*/}
      <div>
        <h2 className="text-2xl font-bold mt-2">
          Estimated vs Actual Wait Time
        </h2>
        <p className="text-sm text-base-content/60 mb-2">
          Positive values mean estimates were longer than actual (conservative).
          Negative values mean actual wait times exceeded estimates
          (optimistic).
        </p>
        <WaitTimeDifferenceChart data={waitTimeDifference} />
      </div>
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

export const QueueCountChart = ({
  data,
  maxX,
  maxY,
}: {
  data: { date: Date; count: number }[];
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
          label={{ value: "count", angle: -90, position: "insideLeft" }}
        />
        <Tooltip />
        <Line
          type="monotone"
          dataKey="count"
          stroke="#8884d8"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export const ServiceTimeChart = ({
  data,
  serviceDuration,
  multiplier = 1.5,
}: {
  data: { date: Date; avgWaitTime: number }[];
  serviceDuration?: number;
  multiplier?: number;
}) => {
  const xDomain: AxisDomain = [0, "auto"];
  const yDomain: AxisDomain = serviceDuration
    ? [0, serviceDuration * multiplier]
    : [0, "auto"];

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

        {/*Reference Line - listed service duration*/}
        {serviceDuration && (
          <ReferenceLine
            y={serviceDuration}
            stroke="#ff7300"
            strokeDasharray="4 4"
            label={{
              value: `${serviceDuration}mins`,
              position: "insideTopRight",
              fontSize: 12,
            }}
          />
        )}

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

export const WaitTimeDifferenceChart = ({
  data,
  maxY,
}: {
  data: { date: Date; difference: number }[];
  maxY?: number;
}) => {
  const xDomain: AxisDomain = [0, "auto"];
  const yDomain: AxisDomain = maxY ? [0, maxY] : ["auto", "auto"];

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
          label={{ value: "minutes", angle: -90, position: "insideLeft" }}
        />
        <Line
          type="monotone"
          dataKey="difference"
          stroke="#82ca9d"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};
