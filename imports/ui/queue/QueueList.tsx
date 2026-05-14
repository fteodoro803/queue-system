import React, { useState, useMemo } from "react";
import { QueueEntry, QueueStatus } from "/imports/api/queueEntry";
import { QueueListItem } from "./QueueListItem";
import { Service } from "/imports/api/service";
import { useDateTime } from "/imports/contexts/DateTimeContext";
import { calculateQueueTime } from "/imports/utils/queueUtils";
import { Patient } from "/imports/api/patient";
import { Stats } from "/imports/api/stats";
import { Provider } from "/imports/api/provider";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

export const QueueList = ({
  queue,
  service,
  states,
  providers,
  patientMap,
  adminView,
  availableProviders,
  stats,
  searchBar,
}: {
  queue: QueueEntry[];
  service: Service;
  states: QueueStatus[];
  providers: Provider[];
  patientMap: Map<string, Patient>;
  adminView?: boolean;
  availableProviders?: number;
  stats?: Stats;
  searchBar?: boolean;
}) => {
  const now = useDateTime();
  const [searchTerm, setSearchTerm] = useState("");

  // Filter queue for entries of this service
  const baseFilteredQueue = useMemo(
    () =>
      queue
        .filter((entry) => entry.serviceId === service._id)
        .filter((entry) => patientMap.has(entry.patientId)),
    [queue, service._id, patientMap],
  );

  // Apply search filter
  const filteredQueue = useMemo(() => {
    if (!searchTerm.trim()) return baseFilteredQueue;

    const searchLower = searchTerm.toLowerCase();
    return baseFilteredQueue.filter((entry) => {
      const patient = patientMap.get(entry.patientId);
      const displayId = entry.displayId?.toLowerCase() || "";

      if (adminView) {
        const patientName = patient?.name?.toLowerCase() || "";
        return (
          patientName.includes(searchLower) || displayId.includes(searchLower)
        );
      }

      return displayId.includes(searchLower);
    });
  }, [baseFilteredQueue, searchTerm, patientMap, adminView]);

  const displayedEntries = useMemo(() => {
    return filteredQueue.filter((entry) => states.includes(entry.status));
  }, [filteredQueue, states]);

  return (
    <div className="flex flex-col rounded-box shadow-md bg-base-100 overflow-hidden">
      {/* Search Bar */}
      {searchBar && (
        <div className="flex items-center gap-2 px-4 py-3 border-b border-base-300">
          <MagnifyingGlassIcon className="w-5 h-5 text-base-content opacity-50 shrink-0" />
          <input
            type="text"
            placeholder={
              adminView ? "Search by name or ID..." : "Search by ID..."
            }
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoComplete="off"
            className="input input-bordered input-sm no-focus-ui"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="btn btn-ghost btn-sm"
            >
              ✕
            </button>
          )}
        </div>
      )}

      {/* Queue List */}
      <ul className="list bg-base-100">
        {/* List of Queue Entries */}
        {displayedEntries.length > 0 ? (
          displayedEntries.map((entry) => {
            const estimatedWaitTime = calculateQueueTime({
              queue: filteredQueue,
              queueEntry: entry,
              service: service,
              providers,
              currentTime: now,
              stats: stats,
            });

            return (
              <QueueListItem
                key={entry._id}
                entry={entry}
                patient={patientMap.get(entry.patientId)!}
                service={service}
                timeUntil={estimatedWaitTime}
                availableProviders={availableProviders}
                admin={adminView}
              />
            );
          })
        ) : searchTerm.trim() ? (
          <li className="p-4 text-center text-sm opacity-60">
            No entries matching &ldquo;{searchTerm}&rdquo;
          </li>
        ) : (
          <li className="p-4 text-center text-sm opacity-60">
            No entries in queue
          </li>
        )}
      </ul>
    </div>
  );
};
