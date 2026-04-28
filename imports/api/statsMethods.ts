import { Meteor } from "meteor/meteor";
import {
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

export async function updateStats(data: StatsData): Promise<void> {
  await Meteor.callAsync("stats.update", data);
}

export const getStatsQuery = (
  serviceId: string,
  date: Date,
  daysBack: number = 30,
) => {
  const startDate = new Date(date);
  startDate.setDate(startDate.getDate() - daysBack);

  return StatsCollection.find({
    serviceId,
    date: {
      $gte: startDate,
      $lte: date,
    },
  });
};
