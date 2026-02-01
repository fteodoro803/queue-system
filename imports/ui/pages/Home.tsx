import React from "react";
import { Link } from "react-router-dom";

export const Home = () => {
  return (
    <div>
      <div>
        <h1>Queue Management System</h1>

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
