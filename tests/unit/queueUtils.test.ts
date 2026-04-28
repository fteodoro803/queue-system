import { expect } from "chai";
import { QueueEntry } from "/imports/api/queueEntry";
import { Provider } from "/imports/api/provider";
import { Service } from "/imports/api/service";
import { Stats } from "/imports/api/stats";
import { calculateQueueTime } from "/imports/utils/queueUtils";

const baseService: Service = {
  _id: "service-1",
  name: "General Consultation",
  shortcode: "GC",
  duration: 30,
  description: "Test service",
  priority: 1,
  createdAt: new Date(2026, 1, 1, 9, 0),
};

function makeStats(partial?: Partial<Stats>): Stats {
  return {
    _id: "service-1-2026-02-01",
    serviceId: "service-1",
    date: new Date(2026, 1, 1),
    count: 1,
    totalDuration: 30,
    estimatedWaitTime: 30,
    actualWaitTime: 25,
    ...partial,
  };
}

function makeProvider({
  id,
  active = true,
  available = true,
  serviceId = "service-1",
  enabled = true,
}: {
  id: string;
  active?: boolean;
  available?: boolean;
  serviceId?: string;
  enabled?: boolean;
}): Provider {
  return {
    _id: id,
    name: `Provider ${id}`,
    email: `${id}@example.com`,
    number: "09170000000",
    avatar: null,
    available,
    active,
    services: [
      {
        id: serviceId,
        name: baseService.name,
        enabled,
      },
    ],
    createdAt: new Date(2026, 1, 1, 9, 0),
  };
}

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
    providerId: null,
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
    describe("guards", () => {
    it("returns invalid_position when a waiting queueEntry has no position", () => {
      const queueEntry = makeQueueEntry({
        id: "1",
        status: "waiting",
        position: null,
      });

      const result = calculateQueueTime({
        queue: [queueEntry],
        queueEntry,
        service: baseService,
        providers: [makeProvider({ id: "provider-1" })],
        currentTime: now,
      });

      // Waiting entries must have a queue position to be scheduled.
      expect(result).to.deep.equal({ ok: false, reason: "invalid_position" });
    });

    it("returns invalid_position when a ready queueEntry has no position", () => {
      const queueEntry = makeQueueEntry({
        id: "1-ready",
        status: "ready",
        position: null,
      });

      const result = calculateQueueTime({
        queue: [queueEntry],
        queueEntry,
        service: baseService,
        providers: [makeProvider({ id: "provider-1" })],
        currentTime: now,
      });

      // Ready entries are still part of queue ordering, so position is required.
      expect(result).to.deep.equal({ ok: false, reason: "invalid_position" });
    });

    it("returns no_providers when no active provider can serve the service", () => {
      const result = calculateQueueTime({
        queue: [],
        service: baseService,
        providers: [
          makeProvider({ id: "provider-inactive", active: false }),
          makeProvider({ id: "provider-disabled", enabled: false }),
          makeProvider({ id: "provider-other-service", serviceId: "service-2" }),
        ],
        currentTime: now,
      });

      // All providers are filtered out (inactive/disabled/wrong service).
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
        providers: [makeProvider({ id: "provider-1" })],
        currentTime: now,
      });

      // queueEntry must belong to the same service being estimated.
      expect(result).to.deep.equal({ ok: false, reason: "wrong_service" });
    });

    it("returns remaining time for an in-progress entry with null position", () => {
      const queueEntry = makeQueueEntry({
        id: "1",
        status: "in-progress",
        start: new Date(2026, 1, 1, 9, 45),
      });

      const result = calculateQueueTime({
        queue: [queueEntry],
        queueEntry,
        service: baseService,
        providers: [makeProvider({ id: "provider-1" })],
        currentTime: now,
      });

      // Service duration is 30, started 15 minutes ago => 15 minutes remaining.
      expect(result).to.deep.equal({ ok: true, time: 15 });
    });

    it("returns zero time for in-progress when start is missing", () => {
      const queueEntry = makeQueueEntry({
        id: "1-no-start",
        status: "in-progress",
        start: null,
      });

      const result = calculateQueueTime({
        queue: [queueEntry],
        queueEntry,
        service: baseService,
        providers: [makeProvider({ id: "provider-1" })],
        currentTime: now,
      });

      // Without a start timestamp, function falls back to 0 for in-progress entry.
      expect(result).to.deep.equal({ ok: true, time: 0 });
    });

    it("returns invalid_position when in-progress queueEntry still has a position", () => {
      const queueEntry = makeQueueEntry({
        id: "1b",
        status: "in-progress",
        position: 1,
        start: new Date(2026, 1, 1, 9, 45),
      });

      const result = calculateQueueTime({
        queue: [queueEntry],
        queueEntry,
        service: baseService,
        providers: [makeProvider({ id: "provider-1" })],
        currentTime: now,
      });

      // In-progress entries should already be removed from queue ordering.
      expect(result).to.deep.equal({ ok: false, reason: "invalid_position" });
    });

    it("returns invalid_status when queueEntry is completed", () => {
      const queueEntry = makeQueueEntry({
        id: "1-completed",
        status: "completed",
      });

      const result = calculateQueueTime({
        queue: [queueEntry],
        queueEntry,
        service: baseService,
        providers: [makeProvider({ id: "provider-1" })],
        currentTime: now,
      });

      // Completed entries are terminal and should not get a wait estimate.
      expect(result).to.deep.equal({ ok: false, reason: "invalid_status" });
    });

    it("returns invalid_status when queueEntry is cancelled", () => {
      const queueEntry = makeQueueEntry({
        id: "1-cancelled",
        status: "cancelled",
      });

      const result = calculateQueueTime({
        queue: [queueEntry],
        queueEntry,
        service: baseService,
        providers: [makeProvider({ id: "provider-1" })],
        currentTime: now,
      });

      // Cancelled entries are terminal and should not get a wait estimate.
      expect(result).to.deep.equal({ ok: false, reason: "invalid_status" });
    });
    });

    describe("scheduling", () => {
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
        providers: [
          makeProvider({ id: "provider-1" }),
          makeProvider({ id: "provider-2" }),
        ],
        currentTime: now,
      });

      // Completed entries do not consume any future lane time.
      expect(result).to.deep.equal({ ok: true, time: 0 });
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
        providers: [makeProvider({ id: "provider-1" })],
        currentTime: now,
      });

      // One lane only: starts at 15 (remaining in-progress), then +30, then +30.
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
        providers: [makeProvider({ id: "provider-1" })],
        currentTime: now,
      });

      // In-progress already finished (0), and two people are ahead of target => 60.
      expect(result).to.deep.equal({ ok: true, time: 60 });
    });

    it("ignores completed/cancelled/invalid-position entries while scheduling", () => {
      const queueEntry = makeQueueEntry({
        id: "target-mixed",
        status: "waiting",
        position: 3,
      });

      const queue = [
        makeQueueEntry({
          id: "mix-in-progress",
          status: "in-progress",
          start: new Date(2026, 1, 1, 9, 50), // 20 mins remaining
        }),
        makeQueueEntry({ id: "mix-ready", status: "ready", position: 1 }),
        makeQueueEntry({ id: "mix-waiting", status: "waiting", position: 2 }),
        makeQueueEntry({ id: "mix-invalid", status: "waiting", position: null }),
        makeQueueEntry({ id: "mix-completed", status: "completed" }),
        makeQueueEntry({ id: "mix-cancelled", status: "cancelled" }),
        queueEntry,
      ];

      const result = calculateQueueTime({
        queue,
        queueEntry,
        service: baseService,
        providers: [makeProvider({ id: "provider-1" })],
        currentTime: now,
      });

      // Only waiting/ready with non-null positions are scheduled before target.
      // So lane starts at 20 (in-progress remaining), then +30 (pos1), +30 (pos2).
      expect(result).to.deep.equal({ ok: true, time: 80 });
    });

    it("prefers average duration derived from stats when available", () => {
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
        service: baseService,
        providers: [makeProvider({ id: "provider-1" })],
        currentTime: now,
        stats: makeStats({ count: 3, totalDuration: 60 }), // avg = 20
      });

      // Stats override default duration: 60/3 => 20 minutes per patient.
      expect(result).to.deep.equal({ ok: true, time: 20 });
    });

    it("distributes waiting patients across multiple provider lanes", () => {
      const queueEntry = makeQueueEntry({
        id: "target",
        status: "waiting",
        position: 3,
      });

      const queue = [
        makeQueueEntry({
          id: "12",
          status: "in-progress",
          start: new Date(2026, 1, 1, 9, 45),
        }),
        makeQueueEntry({ id: "13", status: "waiting", position: 1 }),
        makeQueueEntry({ id: "14", status: "ready", position: 2 }),
        queueEntry,
      ];

      const result = calculateQueueTime({
        queue,
        queueEntry,
        service: baseService,
        providers: [
          makeProvider({ id: "provider-1" }),
          makeProvider({ id: "provider-2" }),
        ],
        currentTime: now,
      });

      // Two lanes let the target start sooner than in one-provider scenarios.
      expect(result).to.deep.equal({ ok: true, time: 30 });
    });

    it("returns invalid_position when queueEntry is not schedulable in waiting/ready set", () => {
      const queueEntry = makeQueueEntry({
        id: "target-not-in-waiting",
        status: "waiting",
        position: 5,
      });

      const queue = [
        makeQueueEntry({ id: "15", status: "waiting", position: 1 }),
        makeQueueEntry({ id: "16", status: "ready", position: 2 }),
      ];

      const result = calculateQueueTime({
        queue,
        queueEntry,
        service: baseService,
        providers: [makeProvider({ id: "provider-1" })],
        currentTime: now,
      });

      // Important: queueEntry is provided, but it is not actually in the queue list.
      // targetWaitTime is never assigned, so function returns
      // invalid_position for that entry.
      expect(result).to.deep.equal({ ok: false, reason: "invalid_position" });
    });

    it("reduces entry wait time with multiple providers for the same mixed queue", () => {
      const queueEntry = makeQueueEntry({
        id: "target-multi",
        status: "waiting",
        position: 4,
      });

      const queue = [
        makeQueueEntry({
          id: "17",
          status: "in-progress",
          start: new Date(2026, 1, 1, 9, 45), // 15 mins remaining
        }),
        makeQueueEntry({ id: "18", status: "waiting", position: 1 }),
        makeQueueEntry({ id: "19", status: "ready", position: 2 }),
        makeQueueEntry({ id: "20", status: "waiting", position: 3 }),
        queueEntry,
      ];

      const singleProvider = calculateQueueTime({
        queue,
        queueEntry,
        service: baseService,
        providers: [makeProvider({ id: "provider-1" })],
        currentTime: now,
      });

      const multipleProviders = calculateQueueTime({
        queue,
        queueEntry,
        service: baseService,
        providers: [
          makeProvider({ id: "provider-1" }),
          makeProvider({ id: "provider-2" }),
        ],
        currentTime: now,
      });

      // Same queue, but more lanes reduces wait for the same target entry.
      expect(singleProvider).to.deep.equal({ ok: true, time: 105 });
      expect(multipleProviders).to.deep.equal({ ok: true, time: 45 });
    });
    });
  });
});
