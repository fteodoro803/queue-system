import { Stats, ViewWindow } from "/imports/api/stats";
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

type AggregationConfig<TAcc, TResult extends { date: Date }> = {
  validate: (stat: Stats) => boolean;
  initial: () => TAcc;
  accumulate: (acc: TAcc, item: Stats) => TAcc;
  finalize: (date: Date, acc: TAcc) => TResult;
};

/**
 * Generic chart data builder that filters, groups, and aggregates stats
 * into a sorted array of data points for use in charts.
 *
 * @template TAcc - The accumulator type used during grouping (intermediate state)
 * @template TResult - The final output type, must include a `date` field for sorting
 *
 * @param stats - Raw stats documents from the database
 * @param view - The time window determining which granularity to use (e.g. daily, monthly)
 * @param service - Optional service to filter stats by. If undefined, all services are combined
 * @param config - Aggregation config defining how to validate, accumulate, and finalize data
 * @returns A sorted array of TResult objects, ascending by date. Returns [] if stats is empty
 * or any stat fails validation.
 *
 * @example
 * // The total completed appointments per day for a specific service
 * buildChartData(stats, view, service, {
 *   validate: (stat) => stat.date != null && stat.numCompletedAppointments != null,
 *   initial: () => ({ numCompletedAppointments: 0 }),
 *   accumulate: (acc, item) => ({
 *     numCompletedAppointments: acc.numCompletedAppointments + item.numCompletedAppointments,
 *   }),
 *   finalize: (date, acc) => ({ date, count: acc.numCompletedAppointments }),
 * });
 */
const buildChartData = <TAcc, TResult extends { date: Date }>(
  stats: Stats[],
  view: ViewWindow,
  service: Service | undefined,
  config: AggregationConfig<TAcc, TResult>,
): TResult[] => {
  if (stats.length === 0) return [];

  // 1. Determine required granularity based on the view window
  const granularity = viewToGranularity(view);

  // 2. Validate that all stats have the necessary fields for the chosen metric
  // TODO: warn about missing fields, or skip invalid entries instead of returning empty array?
  if (stats.some((stat) => !config.validate(stat))) {
    console.warn("Some stats are missing required fields");
    return [];
  }

  // 3. Filter stats by service and granularity
  const filtered = filteredByService(service, stats, granularity);

  // 4. Group stats by date and aggregate using the provided accumulate function
  const grouped = groupBy(
    filtered,
    (stat) => stat.date.toISOString(),
    (acc, item) =>
      config.accumulate(acc as unknown as TAcc, item) as unknown as Stats,
  );

  // 5. Convert the aggregated data into the desired output format and sort by date
  return Object.entries(grouped)
    .map(([date, data]) =>
      config.finalize(new Date(date), data as unknown as TAcc),
    )
    .sort((a, b) => a.date.getTime() - b.date.getTime());
};

/**
 * Calculates average service time per day, optionally filtered by a specific service.
 *
 * @param stats - Array of Stats objects containing service time data.
 * @param service - Optional Service object to filter the stats by a specific service.
 * @param view
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
  view: ViewWindow,
  service?: Service,
): { date: Date; avgWaitTime: number }[] => {
  return buildChartData(stats, view, service, {
    validate: (stat) =>
      !!stat.date &&
      stat.totalDuration !== undefined &&
      stat.numCompletedAppointments !== undefined,
    initial: () => ({
      totalDuration: 0,
      numCompletedAppointments: 0,
    }),
    accumulate: (acc, item) => ({
      totalDuration: acc.totalDuration + item.totalDuration,
      numCompletedAppointments:
        acc.numCompletedAppointments + item.numCompletedAppointments,
    }),
    finalize: (date, acc) => ({
      date,
      avgWaitTime:
        acc.numCompletedAppointments > 0
          ? Math.round(acc.totalDuration / acc.numCompletedAppointments)
          : 0,
    }),
  });
};

/**
 * Calculates total queue entries per day, optionally filtered by a specific service.
 *
 * @param stats - Array of Stats objects containing queue entry data.
 * @param view
 * @param service - Optional Service object to filter the stats by a specific service.
 * @returns An array of DataPoint objects sorted by date ascending.
 */
export const getQueueCount = (
  stats: Stats[],
  view: ViewWindow,
  service?: Service,
): { date: Date; count: number }[] => {
  return buildChartData(stats, view, service, {
    validate: (stat) => !!stat.date && !!stat.numCompletedAppointments,

    initial: () => ({ numCompletedAppointments: 0 }),

    accumulate: (acc, item) => ({
      numCompletedAppointments:
        acc.numCompletedAppointments + item.numCompletedAppointments,
    }),

    finalize: (date, acc) => ({
      date,
      count: acc.numCompletedAppointments,
    }),
  });
};

/**
 * Calculates the difference between average estimated and actual wait times per day,
 * optionally filtered by a specific service.
 *
 * @param stats - Array of Stats objects containing wait time data.
 * @param view
 * @param service - Optional Service object to filter the stats by a specific service.
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
  view: ViewWindow,
  service?: Service,
): { date: Date; difference: number }[] => {
  const calculateAverageDifference = (
    estimatedWaitTime: number,
    actualWaitTime: number,
    count: number,
  ): number => {
    if (count === 0) return 0;
    const avgEstimated = estimatedWaitTime / count;
    const avgActual = actualWaitTime / count;
    return Math.round(avgEstimated - avgActual);
  };

  return buildChartData(stats, view, service, {
    validate: (stat) =>
      !!stat.date &&
      !!stat.numCompletedAppointments &&
      !!stat.estimatedWaitTime &&
      !!stat.actualWaitTime,

    initial: () => ({
      numCompletedAppointments: 0,
      estimatedWaitTime: 0,
      actualWaitTime: 0,
    }),

    accumulate: (acc, item) => ({
      numCompletedAppointments:
        acc.numCompletedAppointments + item.numCompletedAppointments,
      estimatedWaitTime: acc.estimatedWaitTime + item.estimatedWaitTime,
      actualWaitTime: acc.actualWaitTime + item.actualWaitTime,
    }),

    finalize: (date, acc) => ({
      date,
      difference: calculateAverageDifference(
        acc.estimatedWaitTime,
        acc.actualWaitTime,
        acc.numCompletedAppointments,
      ),
    }),
  });
};

const viewToGranularity = (view: ViewWindow): StatsGranularity => {
  switch (view) {
    case "day":
      return "hourly";
    case "month":
      return "daily";
    case "year":
      return "monthly";
    default:
      throw new Error(`Invalid view: ${view}`);
  }
};
