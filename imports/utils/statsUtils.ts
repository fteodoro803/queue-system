import { Stats, ViewWindow } from "/imports/api/stats";
import { Service } from "/imports/api/service";
import { StatsGranularity } from "/imports/api/stats";

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
export const buildChartData = <TAcc, TResult extends { date: Date }>(
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

// Filters stats by service and granularity. If service is undefined, includes all services.
const filteredByService = (
  service: Service | undefined,
  stats: Stats[],
  granularity: StatsGranularity,
) =>
  (service
    ? stats.filter((stat) => stat.serviceId === service._id)
    : stats
  ).filter((stat) => stat.granularity === granularity);

// Maps a view window to the corresponding stats granularity
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
