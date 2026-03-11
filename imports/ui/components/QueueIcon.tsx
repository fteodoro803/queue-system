import React from "react";
import { QueueEntry } from "/imports/api/queueEntry";

interface QueueIconProps {
  entry: QueueEntry;
  size?: number; // optional, default square size
}

export const QueueIcon = ({ entry, size = 70 }: QueueIconProps) => {
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
      }`}
      style={{ width: size, height: size }}
    >
      {isInProgress ? (
        <span className="loading loading-dots loading-xl"></span>
      ) : (
        <span className="text-3xl font-bold">{position}</span>
      )}
    </div>
  );
};
