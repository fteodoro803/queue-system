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

  return (
    <div
      className="flex flex-col items-center justify-center rounded-2xl bg-primary/10 text-primary"
      style={{ width: size, height: size }}
    >
      <span className="text-3xl font-bold">{position}</span>
    </div>
  );
};
