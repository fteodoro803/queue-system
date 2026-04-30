import { Stats, ViewWindow } from "/imports/api/stats";
import { Service } from "/imports/api/service";
import { buildChartData } from "/imports/utils/statsUtils";

/**
 * Calculates average service time according to different granularities, optionally filtered by a specific service.
 *
 * @param stats - Array of Stats objects containing service time data.
 * @param service - Optional Service object to filter the stats by a specific service.
 * @param view - "day", "month", or "year" to determine the granularity of the data (hourly, daily, monthly).
 * @returns An array of DataPoint objects sorted by date ascending.
 *
 * @example
 * // All services combined
 * getAverageServiceTime({ stats, "month" })
 *
 * // Filtered to one service
 * getAverageServiceTime({ stats, "month", service: selectedService })
 */
export const getAverageServiceTimeChartData = (
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

export const getQueueCountChartData = (
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

export const getWaitTimeDifferenceChartData = (
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
