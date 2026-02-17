import React from "react";

interface DateIconProps {
  date: Date;
  size?: number; // optional, default square size
}

export const DateIcon = ({ date, size = 70 }: DateIconProps) => {
  const month = date.toLocaleString("en-US", { month: "short" });
  const day = date.getDate();

  return (
    <div
      className="flex flex-col items-center justify-center rounded-2xl bg-primary-content text-primary"
      style={{ width: size, height: size }}
    >
      <span className="text-sm font-semibold">{month.toUpperCase()}</span>
      <span className="text-3xl font-bold">{day}</span>
    </div>
  );
};
