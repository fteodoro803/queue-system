import React from "react";
import { QueueEntry } from "/imports/api/queueEntry";

interface QueueIconProps {
  entry: QueueEntry;
  className?: string; // use for responsive Tailwind sizing e.g. "w-14 h-14 md:w-[70px] md:h-[70px]"
}

export const QueueIcon = ({ entry, className }: QueueIconProps) => {
  const size: number = 70; // used if no className argument size provided
  const position: string =
    entry.status === "completed"
      ? "✓"
      : entry.status === "cancelled"
        ? "✗"
        : entry.position?.toString() || "?";

  const isInProgress = entry.status === "in-progress";

  return (
    <div
      className={`flex flex-col items-center justify-center rounded-2xl ${
        isInProgress
          ? "bg-success/15 text-success"
          : "bg-primary/10 text-primary"
      } ${className ?? ""}`}
      style={className ? undefined : { width: size, height: size }}
    >
      {isInProgress ? (
        <span className="loading loading-dots loading-xl"></span>
      ) : (
        <span className="text-3xl font-bold">{position}</span>
      )}
    </div>
  );
};
