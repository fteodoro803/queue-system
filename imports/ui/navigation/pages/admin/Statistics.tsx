import React, { useEffect, useState } from "react";
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
} from "/imports/ui/components/Charts";

export const Statistics = () => {
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

  if (isServicesLoading() || isStatsLoading()) {
    return <Loading />;
  }

  // Chart Data
  const queueCount = getQueueCountChartData(stats, view, selectedService);
  const averageServiceTime = getAverageServiceTimeChartData(
    stats,
    view,
    selectedService,
  );
  const waitTimeDifference = getWaitTimeDifferenceChartData(
    stats,
    view,
    selectedService,
  );

  return (
    <>
      <h1 className="text-3xl font-bold">Statistics</h1>

      <div className={"mt-4 "}>
        <ServiceSelect
          services={services}
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

      {/* Queue Entries*/}
      <div>
        <h2 className="text-2xl font-bold mt-2">Queue Entries</h2>
        <QueueCountChart data={queueCount} />
      </div>

      {/*Average Service Time*/}
      <div>
        <h2 className="text-2xl font-bold mt-2">Average Service Time</h2>
        <p className="text-sm text-base-content/60 mb-2">
          Red dashed line is the listed service time.
        </p>
        <ServiceTimeChart
          data={averageServiceTime}
          serviceDuration={selectedService?.duration}
        />
      </div>

      {/*Wait Time Difference*/}
      <div>
        <h2 className="text-2xl font-bold mt-2">
          Estimated vs Actual Wait Time
        </h2>
        <p className="text-sm text-base-content/60 mb-2">
          Positive values mean estimates were longer than actual (conservative).
          Negative values mean actual wait times exceeded estimates
          (optimistic).
        </p>
        <WaitTimeDifferenceChart data={waitTimeDifference} />
      </div>
    </>
  );
};

const ViewWindowSelect = ({
  view,
  setView,
}: {
  view: ViewWindow;
  setView: (value: ViewWindow) => void;
}) => {
  return (
    <fieldset className="fieldset">
      <legend className="fieldset-legend">Select Granularity</legend>
      <select
        value={view}
        className="select"
        onChange={(e) => setView(e.target.value as ViewWindow)}
      >
        <option value="day">Day</option>
        <option value="month">Month</option>
        {/*<option value="year">Year</option>*/}
      </select>
    </fieldset>
  );
};

const ServiceSelect = ({
  services,
  setSelectedService,
}: {
  services: Service[];
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
    <fieldset className="fieldset">
      <legend className="fieldset-legend">
        Select a Service for more specific information
      </legend>
      <select defaultValue="" className="select" onChange={handleChange}>
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
    <div>
      <input
        type="date"
        className="input"
        value={date ? date.toISOString().split("T")[0] : ""}
        onChange={handleChange}
      />
    </div>
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
    <fieldset className="fieldset">
      {/*<legend className="fieldset-legend">Select a Date Range</legend>*/}
      <div className="flex gap-4">
        <div>
          <label className="label">From:</label>
          <input
            type="date"
            className="input"
            value={minDate ? minDate.toISOString().split("T")[0] : ""}
            onChange={handleMinDateChange}
          />
        </div>
        <div>
          <label className="label">To:</label>
          <input
            type="date"
            className="input"
            value={maxDate ? maxDate.toISOString().split("T")[0] : ""}
            onChange={handleMaxDateChange}
          />
        </div>
      </div>
      <span className="label">Optional</span>
    </fieldset>
  );
};
