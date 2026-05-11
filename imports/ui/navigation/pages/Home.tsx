import React from "react";
import { Link } from "react-router-dom";
import { useDateTime } from "/imports/contexts/DateTimeContext";

export const Home = () => {
  const now = useDateTime();
  const dayOfWeek = now.toLocaleDateString(undefined, { weekday: "long" });
  const date = now.toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const time = now.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="card bg-base-100 p-6 shadow-md">
        <div className="flex flex-col items-center gap-4 text-center">
          <h1 className="text-3xl font-bold">Queue Management System Demo</h1>

          <div className="space-y-1 text-sm text-base-content/80">
            <p>
              <span className="font-semibold">Day:</span> {dayOfWeek}
            </p>
            <p>
              <span className="font-semibold">Date:</span> {date}
            </p>
            <p>
              <span className="font-semibold">Time:</span> {time}
            </p>
          </div>

          <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
            <Link to="/patient/queue">
              <button className="btn">Patient View</button>
            </Link>

            {/*<Link to="/service">*/}
            {/*  <button className="btn">Employee View</button>*/}
            {/*</Link>*/}

            <Link to="/admin/dashboard">
              <button className="btn">Admin View</button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
