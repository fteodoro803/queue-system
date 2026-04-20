import { expect } from "chai";
import { QueueEntry } from "/imports/api/queueEntry";
import { Service } from "/imports/api/service";
import { calculateQueueTime } from "/imports/utils/queueUtils";

// TODO: tests for multiple providers

const baseService: Service = {
  _id: "service-1",
  name: "General Consultation",
  shortcode: "GC",
  duration: 30,
  description: "Test service",
  priority: 1,
  createdAt: new Date(2026, 1, 1, 9, 0),
};

function makeQueueEntry({
  id,
  status,
  serviceId = "service-1",
  position = null,
  start = null,
}: {
  id: string;
  status: QueueEntry["status"];
  serviceId?: string;
  position?: number | null;
  start?: Date | null;
}): QueueEntry {
  return {
    _id: id,
    displayId: `Q-${id}`,
    patientId: `patient-${id}`,
    serviceId,
    position,
    status,
    initialEstimatedWaitTime: null,
    readyAt: null,
    start,
    end: null,
    createdAt: new Date(2026, 1, 1, 9, 0),
  };
}

describe("[UNIT] QueueUtils", () => {
  const now = new Date(2026, 1, 1, 10, 0); // Feb 1, 2026, 10:00 AM

  describe("calculateQueueTime()", () => {
    it("returns invalid_position when queueEntry has no position", () => {
      const queueEntry = makeQueueEntry({
        id: "1",
        status: "waiting",
        position: null,
      });

      const result = calculateQueueTime({
        queue: [queueEntry],
        queueEntry,
        service: baseService,
        activeProviders: 1,
        currentTime: now,
      });

      expect(result).to.deep.equal({ ok: false, reason: "invalid_position" });
    });

    it("returns no_providers when activeProviders is zero", () => {
      const result = calculateQueueTime({
        queue: [],
        service: baseService,
        activeProviders: 0,
        currentTime: now,
      });

      expect(result).to.deep.equal({ ok: false, reason: "no_providers" });
    });

    it("returns wrong_service when queueEntry is for a different service", () => {
      const queueEntry = makeQueueEntry({
        id: "2",
        status: "waiting",
        position: 2,
        serviceId: "service-2",
      });

      const result = calculateQueueTime({
        queue: [queueEntry],
        queueEntry,
        service: baseService,
        activeProviders: 1,
        currentTime: now,
      });

      expect(result).to.deep.equal({ ok: false, reason: "wrong_service" });
    });

    it("returns zero time when there are no active queue entries for the service", () => {
      const result = calculateQueueTime({
        queue: [
          makeQueueEntry({
            id: "3",
            status: "completed",
            position: null,
          }),
        ],
        service: baseService,
        activeProviders: 2,
        currentTime: now,
      });

      expect(result).to.deep.equal({ ok: true, time: 0 });
    });

    it("calculates full queue time with only in-progress entries with 1 provider", () => {
      const queue = [
        makeQueueEntry({
          id: "1",
          status: "in-progress",
          start: new Date(2026, 1, 1, 9, 45),
        }),
      ];

      const result = calculateQueueTime({
        queue,
        service: baseService,
        activeProviders: 1,
        currentTime: now,
      });

      // Remaining in-progress time: 15 minutes
      expect(result).to.deep.equal({ ok: true, time: 15 });
    });

    it("calculates full queue time without queueEntry with 1 provider", () => {
      const queue = [
        makeQueueEntry({
          id: "4",
          status: "in-progress",
          start: new Date(2026, 1, 1, 9, 45),
        }),
        makeQueueEntry({ id: "5", status: "waiting", position: 1 }),
        makeQueueEntry({ id: "6", status: "ready", position: 2 }),
      ];

      const result = calculateQueueTime({
        queue,
        service: baseService,
        activeProviders: 1,
        currentTime: now,
      });

      // Remaining in-progress time: 15, waiting+ready ahead: 60 => 75 minutes
      expect(result).to.deep.equal({ ok: true, time: 75 });
    });

    it("calculates entry-specific time using only people ahead", () => {
      const queueEntry = makeQueueEntry({
        id: "target",
        status: "waiting",
        position: 3,
      });

      const queue = [
        makeQueueEntry({
          id: "7",
          status: "in-progress",
          start: new Date(2026, 1, 1, 9, 30),
        }),
        makeQueueEntry({ id: "8", status: "ready", position: 1 }),
        makeQueueEntry({ id: "9", status: "waiting", position: 2 }),
        queueEntry,
      ];

      const result = calculateQueueTime({
        queue,
        queueEntry,
        service: baseService,
        activeProviders: 1,
        currentTime: now,
      });

      // Remaining in-progress time: 0, two people ahead * 30 => 60
      expect(result).to.deep.equal({ ok: true, time: 60 });
    });

    it("prefers avgDuration when available", () => {
      const serviceWithAverage: Service = {
        ...baseService,
        avgDuration: 20,
      };

      const queueEntry = makeQueueEntry({
        id: "10",
        status: "waiting",
        position: 2,
      });

      const queue = [
        makeQueueEntry({ id: "11", status: "ready", position: 1 }),
        queueEntry,
      ];

      const result = calculateQueueTime({
        queue,
        queueEntry,
        service: serviceWithAverage,
        activeProviders: 1,
        currentTime: now,
      });

      expect(result).to.deep.equal({ ok: true, time: 20 });
    });
  });
});
