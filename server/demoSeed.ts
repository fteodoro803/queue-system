import { PatientsCollection } from "/imports/api/patient";
import { ProviderCollection } from "/imports/api/provider";
import { QueueEntryCollection } from "/imports/api/queueEntry";
import { ServicesCollection } from "/imports/api/service";
import { AppointmentsCollection } from "/imports/api/appointment";
import { CountersCollection } from "/imports/api/counters";
import { StatsCollection } from "/imports/api/stats";

type SeedDailyStats = {
  date: Date;
  numCompletedAppointments: number;
  numCancellations: number;
  totalDuration: number;
  estimatedWaitTime: number;
  actualWaitTime: number;
};

/**
 * Clears seeded business collections and inserts a fresh demo dataset.
 */
export async function forceReseedDemoData(date: Date): Promise<void> {
  await QueueEntryCollection.removeAsync({});
  await AppointmentsCollection.removeAsync({});
  await ProviderCollection.removeAsync({});
  await PatientsCollection.removeAsync({});
  await ServicesCollection.removeAsync({});
  await CountersCollection.removeAsync({});
  await StatsCollection.removeAsync({});
  await insertDemoData(date);
}

async function insertDemoData(date: Date): Promise<void> {
  const now = date;
  const minutesAgo = (minutes: number) =>
    new Date(now.getTime() - minutes * 60 * 1000);

  // 2 services
  await ServicesCollection.insertAsync({
    _id: "seed-service-general",
    name: "General Consultation",
    shortcode: "GC",
    duration: 20,
    cost: 500,
    description: "General checkup and consultation",
    priority: 1,
    createdAt: minutesAgo(240),
  });

  await ServicesCollection.insertAsync({
    _id: "seed-service-vaccination",
    name: "Vaccination",
    shortcode: "VC",
    duration: 15,
    cost: 250,
    description: "Routine vaccination service",
    priority: 1,
    createdAt: minutesAgo(240),
  });

  // 3 providers
  await ProviderCollection.insertAsync({
    _id: "seed-provider-alex",
    name: "Alex Rivera",
    email: "alex.demo@example.com",
    number: "09170000001",
    avatar: null,
    available: true,
    active: true,
    services: [
      {
        id: "seed-service-general",
        name: "General Consultation",
        enabled: true,
      },
    ],
    createdAt: minutesAgo(220),
  });

  await ProviderCollection.insertAsync({
    _id: "seed-provider-blair",
    name: "Blair Santos",
    email: "blair.demo@example.com",
    number: "09170000002",
    avatar: null,
    available: true,
    active: true,
    services: [
      {
        id: "seed-service-general",
        name: "General Consultation",
        enabled: true,
      },
      { id: "seed-service-vaccination", name: "Vaccination", enabled: true },
    ],
    createdAt: minutesAgo(220),
  });

  await ProviderCollection.insertAsync({
    _id: "seed-provider-casey",
    name: "Casey Lim",
    email: "casey.demo@example.com",
    number: "09170000003",
    avatar: null,
    available: false,
    active: false,
    services: [
      { id: "seed-service-vaccination", name: "Vaccination", enabled: true },
    ],
    createdAt: minutesAgo(220),
  });

  // 5 patients (supports 5 queue entries)
  await PatientsCollection.insertAsync({
    _id: "seed-patient-1",
    name: "Jordan Cruz",
    email: "jordan.demo@example.com",
    number: "09171111111",
    avatar: null,
    createdAt: minutesAgo(200),
  });
  await PatientsCollection.insertAsync({
    _id: "seed-patient-2",
    name: "Taylor Ong",
    email: "taylor.demo@example.com",
    number: "09172222222",
    avatar: null,
    createdAt: minutesAgo(190),
  });
  await PatientsCollection.insertAsync({
    _id: "seed-patient-3",
    name: "Morgan Lee",
    email: "morgan.demo@example.com",
    number: "09173333333",
    avatar: null,
    createdAt: minutesAgo(180),
  });
  await PatientsCollection.insertAsync({
    _id: "seed-patient-4",
    name: "Riley Tan",
    email: "riley.demo@example.com",
    number: "09174444444",
    avatar: null,
    createdAt: minutesAgo(170),
  });
  await PatientsCollection.insertAsync({
    _id: "seed-patient-5",
    name: "Avery Dela Cruz",
    email: "avery.demo@example.com",
    number: "09175555555",
    avatar: null,
    createdAt: minutesAgo(160),
  });

  // 5 queue entries with all statuses represented at least once.
  await QueueEntryCollection.insertAsync({
    _id: "seed-queue-waiting",
    displayId: "GC-01",
    patientId: "seed-patient-1",
    serviceId: "seed-service-general",
    providerId: null,
    position: 1,
    status: "waiting",
    initialEstimatedWaitTime: 20,
    readyAt: null,
    start: null,
    end: null,
    createdAt: minutesAgo(50),
  });

  await QueueEntryCollection.insertAsync({
    _id: "seed-queue-ready",
    displayId: "GC-02",
    patientId: "seed-patient-2",
    serviceId: "seed-service-general",
    providerId: null,
    position: 2,
    status: "ready",
    initialEstimatedWaitTime: 35,
    readyAt: minutesAgo(10),
    start: null,
    end: null,
    createdAt: minutesAgo(45),
  });

  await QueueEntryCollection.insertAsync({
    _id: "seed-queue-in-progress",
    displayId: "GC-03",
    patientId: "seed-patient-3",
    serviceId: "seed-service-general",
    providerId: "seed-provider-alex",
    position: null,
    status: "in-progress",
    initialEstimatedWaitTime: 10,
    readyAt: minutesAgo(20),
    start: minutesAgo(8),
    end: null,
    createdAt: minutesAgo(40),
  });

  await QueueEntryCollection.insertAsync({
    _id: "seed-queue-completed",
    displayId: "VC-01",
    patientId: "seed-patient-4",
    serviceId: "seed-service-vaccination",
    providerId: "seed-provider-casey",
    position: null,
    status: "completed",
    initialEstimatedWaitTime: 15,
    readyAt: minutesAgo(90),
    start: minutesAgo(80),
    end: minutesAgo(65),
    createdAt: minutesAgo(100),
  });

  await QueueEntryCollection.insertAsync({
    _id: "seed-queue-cancelled",
    displayId: "VC-02",
    patientId: "seed-patient-5",
    serviceId: "seed-service-vaccination",
    providerId: null,
    position: null,
    status: "cancelled",
    initialEstimatedWaitTime: 25,
    readyAt: null,
    start: null,
    end: minutesAgo(15),
    createdAt: minutesAgo(70),
  });

  // Seed the full current calendar month of stats with all granularities.
  const seededDailyGeneral = buildDailyStatsForService({
    serviceType: "general",
    now,
  });
  const seededDailyVaccination = buildDailyStatsForService({
    serviceType: "vaccination",
    now,
  });

  await insertGranularStats("seed-service-general", seededDailyGeneral);
  await insertGranularStats("seed-service-vaccination", seededDailyVaccination);

  return;
}

function buildDailyStatsForService({
  serviceType,
  now,
}: {
  serviceType: "general" | "vaccination";
  now: Date;
}): SeedDailyStats[] {
  const weekdayCompletions =
    serviceType === "general"
      ? [11, 20, 23, 18, 16, 13, 12]
      : [10, 12, 13, 14, 21, 11, 9];
  const baseDuration = serviceType === "general" ? 23 : 13;
  const cancellationRate = serviceType === "general" ? 0.11 : 0.07;
  const rows: SeedDailyStats[] = [];
  const datesInMonth = getUtcDatesForCurrentMonth(now);

  for (const [dayIndex, d] of datesInMonth.entries()) {
    const patternIndex = dayIndex;

    const weekday = d.getUTCDay();
    const weekdayBase = weekdayCompletions[weekday];
    const waveA = Math.sin(
      (patternIndex + (serviceType === "general" ? 2 : 5)) / 3.4,
    );
    const waveB = Math.cos((patternIndex + weekday) / 5.2);
    const weekdayDrift = weekday >= 5 ? -0.08 : weekday <= 2 ? 0.06 : 0;
    const demandFactor = 1 + weekdayDrift + waveA * 0.12 + waveB * 0.06;
    const noise = ((patternIndex * 7 + weekday * 3) % 5) - 2;
    const numCompletedAppointments = Math.max(
      5,
      Math.round(weekdayBase * demandFactor + noise),
    );

    const durationWave =
      Math.sin((patternIndex + 1) / (serviceType === "general" ? 4.2 : 3.3)) *
      (serviceType === "general" ? 3.2 : 2.1);
    const weekdayDurationBias =
      serviceType === "general"
        ? [0.8, 2.1, 1.3, 0.5, -0.6, -1.2, -1.5][weekday]
        : [-0.9, -1.3, -0.6, 0.5, 2.4, 1.1, 0.7][weekday];
    const avgDuration = Math.max(
      serviceType === "general" ? 14 : 8,
      baseDuration + durationWave + weekdayDurationBias,
    );
    const totalDuration = Math.max(
      numCompletedAppointments * 8,
      Math.round(numCompletedAppointments * avgDuration),
    );

    const pressure =
      numCompletedAppointments / (serviceType === "general" ? 18 : 16);
    const estimateBiasWave =
      Math.sin((patternIndex + (serviceType === "general" ? 0 : 7)) / 6) * 1.8;
    const estimatedAvgWait =
      serviceType === "general"
        ? 13 + pressure * 8 + estimateBiasWave
        : 8 + pressure * 6 + estimateBiasWave * 0.8;
    const actualSkew =
      serviceType === "general"
        ? [1.2, 0.6, -0.4, -1.1, -0.8, 0.5, 1.4][weekday]
        : [-1.0, -0.6, 0.4, 0.9, 1.8, 0.7, -0.2][weekday];
    const actualAvgWait = Math.max(
      3,
      estimatedAvgWait + actualSkew + waveB * 1.1,
    );

    const numCancellations = Math.max(
      0,
      Math.round(
        numCompletedAppointments *
          (cancellationRate +
            (weekday >= 5 ? 0.02 : 0) +
            (waveA > 0.7 ? 0.01 : 0)),
      ),
    );

    rows.push({
      date: d,
      numCompletedAppointments,
      totalDuration,
      estimatedWaitTime: Math.round(
        numCompletedAppointments * estimatedAvgWait,
      ),
      actualWaitTime: Math.round(numCompletedAppointments * actualAvgWait),
      numCancellations,
    });
  }

  return rows;
}

function getUtcDatesForCurrentMonth(now: Date): Date[] {
  const monthStart = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1),
  );
  const nextMonthStart = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1),
  );
  const dates: Date[] = [];

  for (
    let cursor = new Date(monthStart);
    cursor < nextMonthStart;
    cursor.setUTCDate(cursor.getUTCDate() + 1)
  ) {
    dates.push(new Date(cursor));
  }

  return dates;
}

async function insertGranularStats(
  serviceId: string,
  dailyRows: SeedDailyStats[],
): Promise<void> {
  for (const row of dailyRows) {
    const dayKey = row.date.toISOString().split("T")[0];

    await StatsCollection.insertAsync({
      _id: `${serviceId}-daily-${dayKey}`,
      serviceId,
      date: new Date(row.date),
      granularity: "daily",
      numCompletedAppointments: row.numCompletedAppointments,
      totalDuration: row.totalDuration,
      estimatedWaitTime: row.estimatedWaitTime,
      actualWaitTime: row.actualWaitTime,
      numCancellations: row.numCancellations,
    });

    const hourWeights = [8, 11, 14, 16, 16, 14, 12, 9];
    const completedByHour = splitIntegerByWeights(
      row.numCompletedAppointments,
      hourWeights,
    );
    const durationByHour = splitIntegerByWeights(
      row.totalDuration,
      hourWeights,
    );
    const estimatedByHour = splitIntegerByWeights(
      row.estimatedWaitTime,
      hourWeights,
    );
    const actualByHour = splitIntegerByWeights(row.actualWaitTime, hourWeights);
    const cancelledByHour = splitIntegerByWeights(
      row.numCancellations,
      hourWeights,
    );

    for (let i = 0; i < hourWeights.length; i++) {
      const hourDate = new Date(row.date);
      hourDate.setUTCHours(9 + i, 0, 0, 0);

      await StatsCollection.insertAsync({
        _id: `${serviceId}-hourly-${dayKey}-${String(9 + i).padStart(2, "0")}`,
        serviceId,
        date: hourDate,
        granularity: "hourly",
        numCompletedAppointments: completedByHour[i],
        totalDuration: durationByHour[i],
        estimatedWaitTime: estimatedByHour[i],
        actualWaitTime: actualByHour[i],
        numCancellations: cancelledByHour[i],
      });
    }
  }

  const monthlyRollups = new Map<string, SeedDailyStats>();
  for (const row of dailyRows) {
    const monthDate = new Date(row.date);
    monthDate.setUTCDate(1);
    monthDate.setUTCHours(0, 0, 0, 0);
    const monthKey = monthDate.toISOString().slice(0, 7);

    const existing = monthlyRollups.get(monthKey);
    if (!existing) {
      monthlyRollups.set(monthKey, {
        date: monthDate,
        numCompletedAppointments: row.numCompletedAppointments,
        totalDuration: row.totalDuration,
        estimatedWaitTime: row.estimatedWaitTime,
        actualWaitTime: row.actualWaitTime,
        numCancellations: row.numCancellations,
      });
      continue;
    }

    existing.numCompletedAppointments += row.numCompletedAppointments;
    existing.totalDuration += row.totalDuration;
    existing.estimatedWaitTime += row.estimatedWaitTime;
    existing.actualWaitTime += row.actualWaitTime;
    existing.numCancellations += row.numCancellations;
  }

  for (const [monthKey, row] of monthlyRollups.entries()) {
    await StatsCollection.insertAsync({
      _id: `${serviceId}-monthly-${monthKey}`,
      serviceId,
      date: row.date,
      granularity: "monthly",
      numCompletedAppointments: row.numCompletedAppointments,
      totalDuration: row.totalDuration,
      estimatedWaitTime: row.estimatedWaitTime,
      actualWaitTime: row.actualWaitTime,
      numCancellations: row.numCancellations,
    });
  }
}

function splitIntegerByWeights(total: number, weights: number[]): number[] {
  if (weights.length === 0) return [];
  if (total <= 0) return new Array(weights.length).fill(0);

  const weightTotal = weights.reduce((sum, w) => sum + w, 0);
  const raw = weights.map((w) => (total * w) / weightTotal);
  const base = raw.map((v) => Math.floor(v));
  let remainder = total - base.reduce((sum, v) => sum + v, 0);

  const indicesByFraction = raw
    .map((v, idx) => ({ idx, frac: v - Math.floor(v) }))
    .sort((a, b) => b.frac - a.frac)
    .map((x) => x.idx);

  let i = 0;
  while (remainder > 0) {
    base[indicesByFraction[i % indicesByFraction.length]] += 1;
    remainder -= 1;
    i += 1;
  }

  return base;
}
