import React, { useEffect, useMemo, useState } from "react";
import { Loading } from "/imports/ui/components/Loading";
import { useFind, useSubscribe } from "meteor/react-meteor-data";
import { Service, ServicesCollection } from "/imports/api/service";
import {
  getAverageServiceTimeChartData,
  getQueueCountChartData,
  getWaitTimeDifferenceChartData,
} from "/imports/utils/chartData";
import { getStatsByDate, getStatsByRange } from "/imports/api/statsMethods";
import { useDateTime } from "/imports/contexts/DateTimeContext";
import { ViewWindow } from "/imports/api/stats";
import {
  QueueCountChart,
  ServiceTimeChart,
  WaitTimeDifferenceChart,
} from "/imports/ui/components/ChartsDemo";

export const StatisticsDemo = () => {
  const now = useDateTime();
  const isServicesLoading = useSubscribe("services");
  const services = useFind(() =>
    ServicesCollection.find({}, { sort: { name: 1 } }),
  );
  const [selectedService, setSelectedService] = useState<Service | undefined>();
  const [minDate, setMinDate] = useState<Date | undefined>();
  const [maxDate, setMaxDate] = useState<Date | undefined>(now);
  const [view, setView] = useState<ViewWindow>("month");

  const isStatsLoading = useSubscribe("stats"); // TODO: subscribe to specific stats
  const stats = useFind(
    () =>
      view === "day"
        ? getStatsByDate({
            serviceId: selectedService?._id,
            date: maxDate ?? now, // if no maxDate, use now
          })
        : getStatsByRange({
            serviceId: selectedService?._id,
            startDate: minDate, // if no minDate, get all history
            endDate: maxDate, // if no maxDate, up to now
            view,
          }),
    [minDate, maxDate, selectedService?._id, view],
  );

  // Reset date filters based on Granularity
  useEffect(() => {
    // Reset date filters when granularity changes
    setMinDate(undefined);
    setMaxDate(now);

    if (view === "month") {
      const thirtyDaysAgo = new Date(now);
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      setMinDate(thirtyDaysAgo);
    }

    if (view === "year") {
      const oneYearAgo = new Date(now);
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      setMinDate(oneYearAgo);
    }
  }, [view]);

  // Chart Data
  const queueCount = useMemo(
    () => getQueueCountChartData(stats, view, selectedService),
    [stats, view, selectedService],
  );
  const averageServiceTime = useMemo(
    () => getAverageServiceTimeChartData(stats, view, selectedService),
    [stats, view, selectedService],
  );
  const waitTimeDifference = useMemo(
    () => getWaitTimeDifferenceChartData(stats, view, selectedService),
    [stats, view, selectedService],
  );
  const requestMix = useMemo(() => {
    const grouped = new Map<
      string,
      { date: Date; completed: number; cancelled: number }
    >();

    for (const row of stats) {
      const key = row.date.toISOString();
      const existing = grouped.get(key);
      if (existing) {
        existing.completed += row.numCompletedAppointments;
        existing.cancelled += row.numCancellations;
        continue;
      }
      grouped.set(key, {
        date: row.date,
        completed: row.numCompletedAppointments,
        cancelled: row.numCancellations,
      });
    }

    return [...grouped.values()].sort(
      (a, b) => b.date.getTime() - a.date.getTime(),
    );
  }, [stats]);

  const summary = useMemo(() => {
    const totals = stats.reduce(
      (acc, row) => {
        acc.completed += row.numCompletedAppointments;
        acc.cancellations += row.numCancellations;
        acc.totalDuration += row.totalDuration;
        acc.estimatedWait += row.estimatedWaitTime;
        acc.actualWait += row.actualWaitTime;
        return acc;
      },
      {
        completed: 0,
        cancellations: 0,
        totalDuration: 0,
        estimatedWait: 0,
        actualWait: 0,
      },
    );

    const totalRequests = totals.completed + totals.cancellations;
    const averageDuration =
      totals.completed > 0
        ? Math.round(totals.totalDuration / totals.completed)
        : 0;
    const averageActualWait =
      totals.completed > 0
        ? Math.round(totals.actualWait / totals.completed)
        : 0;
    const waitBias =
      totals.completed > 0
        ? Math.round(
            totals.estimatedWait / totals.completed -
              totals.actualWait / totals.completed,
          )
        : 0;

    return {
      ...totals,
      totalRequests,
      averageDuration,
      averageActualWait,
      waitBias,
      cancellationRate:
        totalRequests > 0
          ? Math.round((totals.cancellations / totalRequests) * 100)
          : 0,
    };
  }, [stats]);

  const servicePerformanceRows = useMemo(() => {
    const visibleServices = selectedService ? [selectedService] : services;

    return visibleServices
      .map((service) => {
        const serviceStats = stats.filter(
          (row) => row.serviceId === service._id,
        );
        const count = serviceStats.reduce(
          (sum, row) => sum + row.numCompletedAppointments,
          0,
        );
        const totalDuration = serviceStats.reduce(
          (sum, row) => sum + row.totalDuration,
          0,
        );

        return {
          serviceId: service._id,
          serviceName: service.name,
          count,
          averageDuration: count > 0 ? Math.round(totalDuration / count) : 0,
          listedDuration: service.duration,
        };
      })
      .sort(
        (a, b) =>
          b.count - a.count || a.serviceName.localeCompare(b.serviceName),
      );
  }, [selectedService, services, stats]);

  const latestDataDate = useMemo(() => {
    if (stats.length === 0) return undefined;
    return stats.reduce(
      (latest, current) =>
        current.date.getTime() > latest.getTime() ? current.date : latest,
      stats[0].date,
    );
  }, [stats]);

  const trend = useMemo(() => {
    if (stats.length < 2) {
      return {
        completedDeltaPct: 0,
        avgDurationDelta: 0,
        waitBiasDelta: 0,
      };
    }

    const sorted = [...stats].sort(
      (a, b) => a.date.getTime() - b.date.getTime(),
    );
    const splitAt = Math.floor(sorted.length / 2);
    const previous = sorted.slice(0, splitAt);
    const current = sorted.slice(splitAt);

    const aggregate = (rows: typeof sorted) => {
      const completed = rows.reduce(
        (sum, row) => sum + row.numCompletedAppointments,
        0,
      );
      const totalDuration = rows.reduce(
        (sum, row) => sum + row.totalDuration,
        0,
      );
      const estimated = rows.reduce(
        (sum, row) => sum + row.estimatedWaitTime,
        0,
      );
      const actual = rows.reduce((sum, row) => sum + row.actualWaitTime, 0);
      return { completed, totalDuration, estimated, actual };
    };

    const prev = aggregate(previous);
    const curr = aggregate(current);

    const prevAvgDuration =
      prev.completed > 0 ? prev.totalDuration / prev.completed : 0;
    const currAvgDuration =
      curr.completed > 0 ? curr.totalDuration / curr.completed : 0;
    const prevBias =
      prev.completed > 0
        ? prev.estimated / prev.completed - prev.actual / prev.completed
        : 0;
    const currBias =
      curr.completed > 0
        ? curr.estimated / curr.completed - curr.actual / curr.completed
        : 0;

    return {
      completedDeltaPct:
        prev.completed > 0
          ? Math.round(
              ((curr.completed - prev.completed) / prev.completed) * 100,
            )
          : 0,
      avgDurationDelta: Math.round(currAvgDuration - prevAvgDuration),
      waitBiasDelta: Math.round(currBias - prevBias),
    };
  }, [stats]);

  if (isServicesLoading() || isStatsLoading()) {
    return <Loading />;
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold">Statistics</h1>
        <p className="mt-1 text-sm text-base-content/70">
          Monitor queue volume, service duration, and wait-time accuracy across
          the selected reporting window.
        </p>
      </header>

      <section className="rounded-box border border-base-300 bg-base-100 p-4 shadow-sm">
        <h2 className="text-lg font-semibold">Filters</h2>
        <div className="mt-3 grid gap-4 lg:grid-cols-3">
          <ServiceSelect
            services={services}
            selectedService={selectedService}
            setSelectedService={setSelectedService}
          />

          <ViewWindowSelect view={view} setView={setView} />

          {view === "day" ? (
            <DateSelect date={maxDate} setDate={setMaxDate} />
          ) : (
            <DateRangeSelect
              minDate={minDate}
              maxDate={maxDate}
              setMinDate={setMinDate}
              setMaxDate={setMaxDate}
            />
          )}
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Service"
          value={selectedService?.name ?? "All services"}
        />
        <SummaryCard
          label="Completed appointments"
          value={String(summary.completed)}
          helper={`${summary.totalRequests} total requests`}
        />
        <SummaryCard
          label="Avg service duration"
          value={`${summary.averageDuration} mins`}
          helper={`Listed avg: ${getListedDurationAverage(servicePerformanceRows)} mins`}
        />
        <SummaryCard
          label="Avg actual wait"
          value={`${summary.averageActualWait} mins`}
          helper={`Bias: ${summary.waitBias > 0 ? "+" : ""}${summary.waitBias} mins`}
        />
        <SummaryCard
          label="Cancellations"
          value={String(summary.cancellations)}
          helper={`${summary.cancellationRate}% cancellation rate`}
        />
        <SummaryCard
          label="Total service hours"
          value={`${(summary.totalDuration / 60).toFixed(1)} hrs`}
        />
        <SummaryCard
          label="Data points"
          value={String(stats.length)}
          helper={`View: ${capitalize(view)}`}
        />
        <SummaryCard
          label="Latest data"
          value={
            latestDataDate
              ? latestDataDate.toLocaleDateString(undefined, {
                  dateStyle: "medium",
                })
              : "-"
          }
        />
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        <TrendChip
          label="Completed vs previous period"
          value={`${trend.completedDeltaPct > 0 ? "+" : ""}${trend.completedDeltaPct}%`}
          positiveIsGood
        />
        <TrendChip
          label="Avg duration change"
          value={`${trend.avgDurationDelta > 0 ? "+" : ""}${trend.avgDurationDelta} mins`}
          positiveIsGood={false}
        />
        <TrendChip
          label="Wait bias change"
          value={`${trend.waitBiasDelta > 0 ? "+" : ""}${trend.waitBiasDelta} mins`}
          positiveIsGood
        />
      </section>

      <section className="rounded-box border border-base-300 bg-base-100 p-4 shadow-sm">
        <h2 className="text-xl font-semibold">Service Performance</h2>
        <p className="mt-1 text-sm text-base-content/60">
          Compare appointment count, average duration from stats, listed
          duration, and utilization per service.
        </p>
        {servicePerformanceRows.length > 0 ? (
          <div className="mt-4 overflow-x-auto">
            <table className="table table-zebra table-sm md:table-md">
              <thead>
                <tr>
                  <th>Service</th>
                  <th className="text-right">Count</th>
                  <th className="text-right">Avg Duration</th>
                  <th className="text-right">Listed Duration</th>
                  <th className="text-right">Variance</th>
                </tr>
              </thead>
              <tbody>
                {servicePerformanceRows.map((row) => {
                  const variance = row.averageDuration - row.listedDuration;
                  return (
                    <tr key={row.serviceId}>
                      <td>{row.serviceName}</td>
                      <td className="text-right">{row.count}</td>
                      <td className="text-right">{row.averageDuration} mins</td>
                      <td className="text-right">{row.listedDuration} mins</td>
                      <td
                        className={`text-right ${
                          variance > 0
                            ? "text-warning"
                            : variance < 0
                              ? "text-success"
                              : "text-base-content"
                        }`}
                      >
                        {variance > 0 ? "+" : ""}
                        {variance} mins
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState message="No service rows available for these filters." />
        )}
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-box border border-base-300 bg-base-100 p-4 shadow-sm">
          <h2 className="text-xl font-semibold">Queue Entries</h2>
          <p className="mt-1 text-sm text-base-content/60">
            Completed appointments grouped by {viewToLabel(view)}.
          </p>
          {queueCount.length > 0 ? (
            <QueueCountChart data={queueCount} view={view} />
          ) : (
            <EmptyState message="No queue count data for the selected filters." />
          )}
        </section>

        <section className="rounded-box border border-base-300 bg-base-100 p-4 shadow-sm">
          <h2 className="text-xl font-semibold">Average Service Time</h2>
          <p className="mt-1 text-sm text-base-content/60 mb-2">
            Red dashed line is the listed service time.
          </p>
          {averageServiceTime.length > 0 ? (
            <ServiceTimeChart
              data={averageServiceTime}
              serviceDuration={selectedService?.duration}
              view={view}
            />
          ) : (
            <EmptyState message="No service-time data for the selected filters." />
          )}
        </section>
      </section>

      <section className="rounded-box border border-base-300 bg-base-100 p-4 shadow-sm">
        <h2 className="text-xl font-semibold">Request Mix</h2>
        <p className="mt-1 text-sm text-base-content/60">
          Completed versus cancelled requests in the selected window.
        </p>
        {requestMix.length > 0 ? (
          <div className="mt-4 overflow-x-auto">
            <table className="table table-zebra table-sm md:table-md">
              <thead>
                <tr>
                  <th>Period</th>
                  <th className="text-right">Completed</th>
                  <th className="text-right">Cancelled</th>
                  <th className="text-right">Cancellation Rate</th>
                </tr>
              </thead>
              <tbody>
                {requestMix.slice(0, 12).map((row) => {
                  const total = row.completed + row.cancelled;
                  const rate =
                    total > 0 ? Math.round((row.cancelled / total) * 100) : 0;
                  return (
                    <tr key={row.date.toISOString()}>
                      <td>{formatPeriodLabel(row.date, view)}</td>
                      <td className="text-right">{row.completed}</td>
                      <td className="text-right">{row.cancelled}</td>
                      <td className="text-right">{rate}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState message="No request-mix data for the selected filters." />
        )}
      </section>

      <section className="rounded-box border border-base-300 bg-base-100 p-4 shadow-sm">
        <h2 className="text-xl font-semibold">Estimated vs Actual Wait Time</h2>
        <p className="mt-1 text-sm text-base-content/60 mb-2">
          Positive values mean estimates were longer than actual (conservative).
          Negative values mean actual wait times exceeded estimates
          (optimistic).
        </p>
        {waitTimeDifference.length > 0 ? (
          <WaitTimeDifferenceChart data={waitTimeDifference} view={view} />
        ) : (
          <EmptyState message="No wait-time data for the selected filters." />
        )}
      </section>
    </div>
  );
};

const SummaryCard = ({
  label,
  value,
  helper,
}: {
  label: string;
  value: string;
  helper?: string;
}) => (
  <div className="rounded-box border border-base-300 bg-base-100 p-4 shadow-sm">
    <p className="text-xs uppercase tracking-wide text-base-content/60">
      {label}
    </p>
    <p className="mt-1 text-2xl font-semibold">{value}</p>
    {helper ? (
      <p className="mt-1 text-xs text-base-content/60">{helper}</p>
    ) : null}
  </div>
);

const TrendChip = ({
  label,
  value,
  positiveIsGood,
}: {
  label: string;
  value: string;
  positiveIsGood: boolean;
}) => {
  const numeric = Number.parseFloat(value);
  const isPositive = numeric > 0;
  const isNegative = numeric < 0;

  const tone = isPositive
    ? positiveIsGood
      ? "text-success"
      : "text-warning"
    : isNegative
      ? positiveIsGood
        ? "text-warning"
        : "text-success"
      : "text-base-content";

  return (
    <div className="rounded-box border border-base-300 bg-base-100 px-4 py-3 shadow-sm">
      <p className="text-xs text-base-content/60">{label}</p>
      <p className={`mt-1 text-lg font-semibold ${tone}`}>{value}</p>
    </div>
  );
};

const EmptyState = ({ message }: { message: string }) => (
  <div className="mt-4 rounded-box border border-dashed border-base-300 p-6 text-sm text-base-content/70">
    {message}
  </div>
);

const viewToLabel = (view: ViewWindow): string => {
  switch (view) {
    case "day":
      return "hour";
    case "month":
      return "day";
    case "year":
      return "month";
  }
};

const formatPeriodLabel = (date: Date, view: ViewWindow): string => {
  switch (view) {
    case "day":
      return date.toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        hour: "numeric",
      });
    case "month":
      return date.toLocaleDateString(undefined, { dateStyle: "medium" });
    case "year":
      return date.toLocaleDateString(undefined, {
        month: "short",
        year: "numeric",
      });
  }
};

const capitalize = (value: string): string =>
  value.length ? value.charAt(0).toUpperCase() + value.slice(1) : value;

const getListedDurationAverage = (
  rows: { listedDuration: number }[],
): number => {
  if (rows.length === 0) return 0;
  const total = rows.reduce((sum, row) => sum + row.listedDuration, 0);
  return Math.round(total / rows.length);
};

const ViewWindowSelect = ({
  view,
  setView,
}: {
  view: ViewWindow;
  setView: (value: ViewWindow) => void;
}) => {
  return (
    <fieldset className="fieldset w-full">
      <legend className="fieldset-legend">View</legend>
      <select
        value={view}
        className="select w-full"
        onChange={(e) => setView(e.target.value as ViewWindow)}
      >
        <option value="day">Day</option>
        <option value="month">Month</option>
        <option value="year">Year</option>
      </select>
    </fieldset>
  );
};

const ServiceSelect = ({
  services,
  selectedService,
  setSelectedService,
}: {
  services: Service[];
  selectedService?: Service;
  setSelectedService: (value: Service | undefined) => void;
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    if (!selectedId) {
      setSelectedService(undefined);
      return;
    }
    const service = services.find((s) => s._id === selectedId);
    setSelectedService(service);
  };

  return (
    <fieldset className="fieldset w-full">
      <legend className="fieldset-legend">Service</legend>
      <select
        value={selectedService?._id ?? ""}
        className="select w-full"
        onChange={handleChange}
      >
        <option value="">None</option>
        {services.map((service) => (
          <option key={service._id} value={service._id}>
            {service.name}
          </option>
        ))}
      </select>
      <span className="label">Optional</span>
    </fieldset>
  );
};

const DateSelect = ({
  date,
  setDate,
}: {
  date?: Date;
  setDate: (date: Date | undefined) => void;
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value ? new Date(e.target.value) : undefined;
    setDate(newDate);
  };

  return (
    <fieldset className="fieldset w-full">
      <legend className="fieldset-legend">Date</legend>
      <input
        type="date"
        className="input w-full"
        value={date ? date.toISOString().split("T")[0] : ""}
        onChange={handleChange}
      />
    </fieldset>
  );
};

const DateRangeSelect = ({
  minDate,
  setMinDate,
  maxDate,
  setMaxDate,
}: {
  minDate?: Date;
  setMinDate: (date: Date | undefined) => void;
  maxDate?: Date;
  setMaxDate: (date: Date | undefined) => void;
}) => {
  const handleMinDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value ? new Date(e.target.value) : undefined;
    setMinDate(date);
  };

  const handleMaxDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value ? new Date(e.target.value) : undefined;
    setMaxDate(date);
  };

  return (
    <fieldset className="fieldset w-full">
      <legend className="fieldset-legend">Date Range</legend>
      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <label className="label">From:</label>
          <input
            type="date"
            className="input w-full"
            value={minDate ? minDate.toISOString().split("T")[0] : ""}
            onChange={handleMinDateChange}
          />
        </div>
        <div>
          <label className="label">To:</label>
          <input
            type="date"
            className="input w-full"
            value={maxDate ? maxDate.toISOString().split("T")[0] : ""}
            onChange={handleMaxDateChange}
          />
        </div>
      </div>
      <span className="label">Optional</span>
    </fieldset>
  );
};
