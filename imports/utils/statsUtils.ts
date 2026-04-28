import { Stats } from "/imports/api/stats";
import { Service } from "/imports/api/service";
import { StatsGranularity } from "/imports/api/stats";

/**
 * Groups an array of items by a key, merging items that share the same key.
 *
 * @param items - The array to group.
 * @param getKey - Function that returns the group key for each item.
 * @param mergeStrategy - Function that defines how to combine two items with the same key.
 * @returns A Record where each key maps to a single merged item.
 *
 * @example
 * // Group stats by date, summing duration and count
 * groupBy(
 *   stats,
 *   (stat) => stat.date.toISOString(),   // "2025-01-13" becomes the key
 *   (acc, item) => ({
 *     ...acc,                            // keep all other fields from acc
 *     totalDuration: acc.totalDuration + item.totalDuration,  // sum durations
 *     count: acc.count + item.count,     // sum counts
 *   })
 * )
 *
 * // Input:
 * // [
 * //   { date: "2025-01-13", serviceId: "A", totalDuration: 60, count: 3 },
 * //   { date: "2025-01-13", serviceId: "B", totalDuration: 30, count: 2 },
 * //   { date: "2025-01-14", serviceId: "A", totalDuration: 40, count: 2 },
 * // ]
 * //
 * // Output:
 * // {
 * //   "2025-01-13": { totalDuration: 90, count: 5 },
 * //   "2025-01-14": { totalDuration: 40, count: 2 },
 * // }
 */
const groupBy = <T, K extends string>(
  items: T[],
  getKey: (item: T) => K,
  mergeStrategy: (acc: T, item: T) => T,
): Record<K, T> => {
  return items.reduce<Record<K, T>>(
    (acc, item) => {
      const key = getKey(item);

      if (!acc[key]) {
        acc[key] = { ...item }; // first item for this key becomes the initial value
      } else {
        acc[key] = mergeStrategy(acc[key], item); // merge subsequent items
      }

      return acc;
    },
    {} as Record<K, T>,
  );
};

const filteredByService = (
  service: Service | undefined,
  stats: Stats[],
  granularity: StatsGranularity,
) =>
  (service
    ? stats.filter((stat) => stat.serviceId === service._id)
    : stats
  ).filter((stat) => stat.granularity === granularity);

/**
 * Calculates average service time per day, optionally filtered by a specific service.
 *
 * @param stats - Array of Stats objects containing service time data.
 * @param service - Optional Service object to filter the stats by a specific service.
 * @param granularity
 * @returns An array of DataPoint objects sorted by date ascending.
 *
 * @example
 * // All services combined
 * getAverageServiceTime({ stats })
 *
 * // Filtered to one service
 * getAverageServiceTime({ stats, service: selectedService })
 */
export const getAverageServiceTime = (
  stats: Stats[],
  service?: Service,
  granularity: StatsGranularity = "daily",
): { date: Date; avgWaitTime: number }[] => {
  // Early return if stats array is empty or if any stat is missing required fields
  if (stats.length === 0) return [];
  if (
    stats.some(
      (stat) =>
        !stat.date || !stat.totalDuration || !stat.numCompletedAppointments,
    )
  ) {
    console.warn("Some stats are missing required fields");
    return [];
  }

  // 1. Filter stats if a service is specified, otherwise use all stats
  const filtered = filteredByService(service, stats, granularity);

  // 2. Group by date, summing totalDuration and count across all services per day
  const groupedData = groupBy(
    filtered,
    (stat) => stat.date.toISOString(), // group by date string
    (acc, item) => ({
      ...acc,
      totalDuration: acc.totalDuration + item.totalDuration,
      numCompletedAppointments:
        acc.numCompletedAppointments + item.numCompletedAppointments,
    }),
  );

  // 3. Convert grouped object to a sorted DataPoint array
  const result: { date: Date; avgWaitTime: number }[] = Object.entries(
    groupedData,
  )
    .map(([date, data]) => ({
      date: new Date(date),
      avgWaitTime:
        data.numCompletedAppointments > 0
          ? Math.round(data.totalDuration / data.numCompletedAppointments)
          : 0,
    }))
    .sort((a, b) => a.date.getTime() - b.date.getTime()); // sort by date

  return result;
};

/**
 * Calculates total queue entries per day, optionally filtered by a specific service.
 *
 * @param stats - Array of Stats objects containing queue entry data.
 * @param service - Optional Service object to filter the stats by a specific service.
 * @param granularity
 * @returns An array of DataPoint objects sorted by date ascending.
 */
export const getQueueCount = (
  stats: Stats[],
  service?: Service,
  granularity: StatsGranularity = "daily",
): { date: Date; count: number }[] => {
  // Early return if stats array is empty or if any stat is missing required fields
  if (stats.length === 0) return [];
  if (stats.some((stat) => !stat.date || !stat.numCompletedAppointments)) {
    console.warn("Some stats are missing required fields");
    return [];
  }

  // 1. Filter stats if a service is specified, otherwise use all stats
  const filtered = filteredByService(service, stats, granularity);

  // 2. Group by date, summing count across all services per day
  const groupedData = groupBy(
    filtered,
    (stat) => stat.date.toISOString(), // group by date string
    (acc, item) => ({
      ...acc,
      numCompletedAppointments:
        acc.numCompletedAppointments + item.numCompletedAppointments,
    }),
  );

  // 3. Convert grouped object to a sorted DataPoint array
  const result: { date: Date; count: number }[] = Object.entries(groupedData)
    .map(([date, data]) => ({
      date: new Date(date),
      count: data.numCompletedAppointments,
    }))
    .sort((a, b) => a.date.getTime() - b.date.getTime()); // sort by date

  return result;
};

/**
 * Calculates the difference between average estimated and actual wait times per day,
 * optionally filtered by a specific service.
 *
 * @param stats - Array of Stats objects containing wait time data.
 * @param service - Optional Service object to filter the stats by a specific service.
 * @param granularity
 * @returns An array of DataPoint objects sorted by date ascending.
 *         Positive values indicate estimated times were longer than actual (good prediction).
 *         Negative values indicate estimated times were shorter than actual (underestimated).
 *
 * @example
 * // All services combined
 * getWaitTimeDifference({ stats })
 *
 * // Filtered to one service
 * getWaitTimeDifference({ stats, service: selectedService })
 */
export const getWaitTimeDifference = (
  stats: Stats[],
  service?: Service,
  granularity: StatsGranularity = "daily",
): { date: Date; difference: number }[] => {
  // Early return if stats array is empty or if any stat is missing required fields
  if (stats.length === 0) return [];
  if (
    stats.some(
      (stat) =>
        !stat.date ||
        !stat.numCompletedAppointments ||
        stat.estimatedWaitTime === undefined ||
        stat.actualWaitTime === undefined,
    )
  ) {
    console.warn("Some stats are missing required wait time fields");
    return [];
  }

  // 1. Filter stats if a service is specified, otherwise use all stats
  const filtered = filteredByService(service, stats, granularity);

  // 2. Group by date, summing wait times and count across all services per day
  const groupedData = groupBy(
    filtered,
    (stat) => stat.date.toISOString(), // group by date string
    (acc, item) => ({
      ...acc,
      estimatedWaitTime: acc.estimatedWaitTime + item.estimatedWaitTime,
      actualWaitTime: acc.actualWaitTime + item.actualWaitTime,
      numCompletedAppointments:
        acc.numCompletedAppointments + item.numCompletedAppointments,
    }),
  );

  // 3. Convert grouped object to a sorted DataPoint array
  const result: { date: Date; difference: number }[] = Object.entries(
    groupedData,
  )
    .map(([date, data]) => ({
      date: new Date(date),
      difference:
        data.numCompletedAppointments > 0
          ? Math.round(
              data.estimatedWaitTime / data.numCompletedAppointments -
                data.actualWaitTime / data.numCompletedAppointments,
            )
          : 0,
    }))
    .sort((a, b) => a.date.getTime() - b.date.getTime()); // sort by date

  return result;
};
