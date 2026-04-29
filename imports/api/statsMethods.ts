import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";
import {
  Stats,
  StatsCollection,
  StatsData,
  StatsGranularity,
} from "/imports/api/stats";
import { formateDateToLocaleMonth } from "/imports/utils/utils";

Meteor.methods({
  async "stats.update"(data: StatsData) {
    const granularities: StatsGranularity[] = ["hourly", "daily", "monthly"];
    const { startTime, endTime, ...incrementFields } = data.inc ?? {};

    const duration: number | undefined =
      startTime && endTime
        ? (endTime.getTime() - startTime.getTime()) / 60000
        : undefined;

    // Build $inc from whatever fields are present in StatsIncrementFields,
    // defaulting missing values to 0 so $inc is always valid
    const $inc = {
      totalDuration: duration ?? 0,
      ...Object.fromEntries(
        Object.entries(incrementFields).map(([k, v]) => [k, v ?? 0]),
      ),
    };

    for (const granularity of granularities) {
      const key = getStatsKey(data.serviceId, data.date, granularity);

      await StatsCollection.upsertAsync(
        { _id: key },
        {
          // Set these when creating a new document
          $setOnInsert: {
            _id: key,
            serviceId: data.serviceId,
            granularity,
            date: getPeriodStart(data.date, granularity),
          },

          // Increment/Update fields
          $inc,
        },
      );
    }
  },
});

function getStatsKey(
  serviceId: string,
  date: Date,
  granularity: StatsGranularity,
): string {
  const year = date.getFullYear();
  const month = formateDateToLocaleMonth(date);
  const day = date.getDate();
  const hour = date.getHours();

  switch (granularity) {
    case "hourly":
      return `${serviceId}-${year}-${month}-${day}-${hour}`;
    case "daily":
      return `${serviceId}-${year}-${month}-${day}`;
    case "monthly":
      return `${serviceId}-${year}-${month}`;
    default:
      throw new Error(`Invalid granularity: ${granularity}`);
  }
}

function getPeriodStart(date: Date, granularity: StatsGranularity): Date {
  const d = new Date(date);
  switch (granularity) {
    case "hourly":
      d.setMinutes(0, 0, 0);
      return d;
    case "daily":
      d.setHours(0, 0, 0, 0);
      return d;
    case "monthly":
      d.setDate(1);
      d.setHours(0, 0, 0, 0);
      return d;
  }
}

function getPeriodEnd(date: Date, granularity: StatsGranularity): Date {
  const d = getPeriodStart(date, granularity); // start of current period
  switch (granularity) {
    case "hourly":
      d.setHours(d.getHours() + 1);
      return d;
    case "daily":
      d.setDate(d.getDate() + 1);
      return d;
    case "monthly":
      d.setMonth(d.getMonth() + 1);
      return d;
  }
}

export async function updateStats(data: StatsData): Promise<void> {
  await Meteor.callAsync("stats.update", data);
}

// Get stats for a service for the last x days
export const getStatsQuery = (
  serviceId: string,
  date: Date,
  daysBack: number = 30,
) => {
  const startDate = new Date(date);
  startDate.setDate(startDate.getDate() - daysBack);

  return StatsCollection.find(
    {
      serviceId,
      granularity: "daily",
      date: {
        $gte: startDate,
        $lte: date,
      },
    },
    { sort: { date: -1 } },
  );
};

// TODO: this and the regular getStatsQuery i feel could be better merged or separated. Could be named getStats
// This gets either general stats for all services, or stats for a specific service over a date range, with specific granularity
// Inclusive of startDate, exclusive of endDate (i.e. [startDate, endDate))/
// TODO: untested
export const getStatsByRange = ({
  serviceId,
  startDate,
  endDate,
  view,
}: {
  serviceId?: string;
  startDate?: Date;
  endDate?: Date;
  granularity?: StatsGranularity;
  view: "month" | "year";
}): Mongo.Cursor<Stats, Stats> => {
  const granularity: StatsGranularity = view === "year" ? "monthly" : "daily";
  const startPeriod = startDate
    ? getPeriodStart(startDate, granularity)
    : undefined;
  const endPeriod = endDate ? getPeriodEnd(endDate, granularity) : undefined;

  return StatsCollection.find(
    {
      ...(serviceId && { serviceId }), // only filter by serviceId if it's provided
      granularity,
      ...(startPeriod &&
        endPeriod && {
          date: {
            $gte: startPeriod,
            $lt: endPeriod,
          },
        }),
    },
    { sort: { date: -1 } },
  );
};

// TODO: untested
export const getStatsByDate = ({
  serviceId,
  date,
}: {
  serviceId?: string;
  date: Date;
}): Mongo.Cursor<Stats, Stats> => {
  const start = new Date(date);
  const granularity: StatsGranularity = "hourly";
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  return StatsCollection.find(
    {
      ...(serviceId && { serviceId }),
      granularity,
      date: { $gte: start, $lt: end },
    },
    { sort: { date: -1 } },
  );
};
