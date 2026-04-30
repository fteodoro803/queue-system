import { AxisDomain } from "recharts/types/util/types";
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
import React from "react";

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
            date.toLocaleDateString("en-US", { dateStyle: "short" })
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
