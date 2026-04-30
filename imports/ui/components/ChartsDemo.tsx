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
import { ViewWindow } from "/imports/api/stats";

const formatXAxisTick = (timestamp: number, view: ViewWindow): string => {
  const date = new Date(timestamp);
  switch (view) {
    case "day":
      return date.toLocaleTimeString(undefined, {
        hour: "numeric",
        minute: "2-digit",
      });
    case "month":
      return date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      });
    case "year":
      return date.toLocaleDateString(undefined, {
        month: "short",
        year: "2-digit",
      });
  }
};

const formatTooltipLabel = (timestamp: number, view: ViewWindow): string => {
  const date = new Date(timestamp);
  switch (view) {
    case "day":
      return date.toLocaleString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });
    case "month":
      return date.toLocaleDateString(undefined, { dateStyle: "medium" });
    case "year":
      return date.toLocaleDateString(undefined, {
        month: "long",
        year: "numeric",
      });
  }
};

export const QueueCountChart = ({
  data,
  view,
  maxX,
  maxY,
}: {
  data: { date: Date; count: number }[];
  view: ViewWindow;
  maxX?: number;
  maxY?: number;
}) => {
  const chartData = data.map((item) => ({
    ...item,
    timestamp: item.date.getTime(),
  }));

  const xDomain: AxisDomain = maxX ? [0, maxX] : ["dataMin", "dataMax"];
  const yDomain: AxisDomain = maxY ? [0, maxY] : [0, "auto"];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--bc) / 0.2)" />
        <XAxis
          type="number"
          dataKey="timestamp"
          tickFormatter={(value: number) => formatXAxisTick(value, view)}
          domain={xDomain}
        />
        <YAxis
          domain={yDomain}
          label={{ value: "count", angle: -90, position: "insideLeft" }}
        />
        <Tooltip
          labelFormatter={(value) => formatTooltipLabel(Number(value), view)}
          formatter={(value) => [value, "Count"]}
        />
        <Line
          type="monotone"
          dataKey="count"
          stroke="#6366f1"
          strokeWidth={2}
          dot={chartData.length <= 1}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export const ServiceTimeChart = ({
  data,
  view,
  serviceDuration,
  multiplier = 1.5,
}: {
  data: { date: Date; avgWaitTime: number }[];
  view: ViewWindow;
  serviceDuration?: number;
  multiplier?: number;
}) => {
  const chartData = data.map((item) => ({
    ...item,
    timestamp: item.date.getTime(),
  }));
  const xDomain: AxisDomain = ["dataMin", "dataMax"];
  const yDomain: AxisDomain = serviceDuration
    ? [0, serviceDuration * multiplier]
    : [0, "auto"];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--bc) / 0.2)" />
        <XAxis
          type="number"
          dataKey="timestamp"
          tickFormatter={(value: number) => formatXAxisTick(value, view)}
          domain={xDomain}
        />
        <YAxis
          domain={yDomain}
          label={{ value: "mins", angle: -90, position: "insideLeft" }}
        />
        <Tooltip
          labelFormatter={(value) => formatTooltipLabel(Number(value), view)}
          formatter={(value) => [`${value} mins`, "Avg Duration"]}
        />

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
          stroke="#6366f1"
          strokeWidth={2}
          dot={chartData.length <= 1}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export const WaitTimeDifferenceChart = ({
  data,
  view,
  maxY,
}: {
  data: { date: Date; difference: number }[];
  view: ViewWindow;
  maxY?: number;
}) => {
  const chartData = data.map((item) => ({
    ...item,
    timestamp: item.date.getTime(),
  }));
  const xDomain: AxisDomain = ["dataMin", "dataMax"];
  const yDomain: AxisDomain = maxY ? [0, maxY] : ["auto", "auto"];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--bc) / 0.2)" />
        <XAxis
          type="number"
          dataKey="timestamp"
          tickFormatter={(value: number) => formatXAxisTick(value, view)}
          domain={xDomain}
        />
        <YAxis
          domain={yDomain}
          label={{ value: "minutes", angle: -90, position: "insideLeft" }}
        />
        <Tooltip
          labelFormatter={(value) => formatTooltipLabel(Number(value), view)}
          formatter={(value) => [`${value} mins`, "Difference"]}
        />
        <Line
          type="monotone"
          dataKey="difference"
          stroke="#10b981"
          strokeWidth={2}
          dot={chartData.length <= 1}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};
