import { Meteor } from "meteor/meteor";
import { StatsCollection } from "/imports/api/stats";

export interface StatsData {
  serviceId: string;
  date: Date;
  inc?: {
    isCompleted?: boolean;
    startTime?: Date;
    endTime?: Date;
  };
}

Meteor.methods({
  async "stats.initialise"(data: StatsData): Promise<string> {
    const key = getStatsKey(data.serviceId, data.date);

    await StatsCollection.upsertAsync(
      { _id: key },
      {
        $setOnInsert: {
          _id: key,
          serviceId: data.serviceId,
          date: data.date,
          count: 0,
          totalDuration: 0,
        },
      },
    );

    return key;
  },

  async "stats.update"(data: StatsData) {
    const id = await initialiseStats(data);

    // duration in minutes
    const duration: number | undefined =
      data.inc?.startTime && data.inc?.endTime
        ? (data.inc.endTime.getTime() - data.inc.startTime.getTime()) / 60000
        : undefined;

    return StatsCollection.upsertAsync(
      { _id: id },
      {
        // If inc values are not provided, increment by 0 (no change)
        $inc: {
          count: data.inc?.isCompleted ? 1 : 0,
          totalDuration: duration ?? 0,
        },
      },
    );
  },
});

function getStatsKey(serviceId: string, date: Date): string {
  return `${serviceId}-${date.toISOString().split("T")[0]}`;
}

async function initialiseStats(data: StatsData): Promise<string> {
  return Meteor.callAsync("stats.initialise", data);
}

export async function updateStats(data: StatsData): Promise<void> {
  await Meteor.callAsync("stats.update", data);
}
