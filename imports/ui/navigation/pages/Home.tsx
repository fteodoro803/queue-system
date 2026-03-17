import React from "react";
import { Link } from "react-router-dom";
import { useDateTime } from "/imports/contexts/DateTimeContext";

export const Home = () => {
  const now = useDateTime();

  return (
    <div>
      <div>
        <h1>Queue Management System</h1>

        <p>Current DateTime: {now.toLocaleString()}</p>

        <div className="flex items-center gap-2">
          <Link to="/patient">
            <button className="btn">Patient View</button>
          </Link>
          <Link to="/service">
            <button className="btn">Service View</button>
          </Link>
          <Link to="/admin">
            <button className="btn">Admin View</button>
          </Link>
        </div>
      </div>
    </div>
  );
};
