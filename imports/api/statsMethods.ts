import { Meteor } from "meteor/meteor";
import { StatsCollection, StatsGranularity } from "/imports/api/stats";
import { formateDateToLocaleMonth } from "/imports/utils/utils";

export interface StatsData {
  serviceId: string;
  date: Date;
  inc?: {
    count?: number;
    startTime?: Date;
    endTime?: Date;
    estimatedWaitTime?: number;
    actualWaitTime?: number;
  };
}

Meteor.methods({
  async "stats.update"(data: StatsData) {
    const granularities: StatsGranularity[] = ["hourly", "daily", "monthly"];

    const duration: number | undefined =
      data.inc?.startTime && data.inc?.endTime
        ? (data.inc.endTime.getTime() - data.inc.startTime.getTime()) / 60000
        : undefined;

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
          $inc: {
            count: data.inc?.count ?? 0,
            totalDuration: duration ?? 0,
            estimatedWaitTime: data.inc?.estimatedWaitTime ?? 0,
            actualWaitTime: data.inc?.actualWaitTime ?? 0,
          },
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
