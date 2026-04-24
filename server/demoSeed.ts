import { PatientsCollection } from "/imports/api/patient";
import { ProviderCollection } from "/imports/api/provider";
import { QueueEntryCollection } from "/imports/api/queueEntry";
import { ServicesCollection } from "/imports/api/service";
import { AppointmentsCollection } from "/imports/api/appointment";
import { CountersCollection } from "/imports/api/counters";
import { StatsCollection } from "/imports/api/stats";

async function hasAnyBusinessData(): Promise<boolean> {
  const [
    existingService,
    existingProvider,
    existingPatient,
    existingQueueEntry,
    existingAppointment,
    existingStats,
  ] = await Promise.all([
    ServicesCollection.findOneAsync({}),
    ProviderCollection.findOneAsync({}),
    PatientsCollection.findOneAsync({}),
    QueueEntryCollection.findOneAsync({}),
    AppointmentsCollection.findOneAsync({}),
    StatsCollection.findOneAsync({}),
  ]);

  return Boolean(
    existingService ||
      existingProvider ||
      existingPatient ||
      existingQueueEntry ||
      existingAppointment ||
      existingStats,
  );
}

/**
 * Seeds demo data only when the main business collections are all empty.
 */
export async function seedDemoDataIfEmpty(): Promise<boolean> {
  if (await hasAnyBusinessData()) {
    return false;
  }

  await insertDemoData();
  return true;
}

/**
 * Clears seeded business collections and inserts a fresh demo dataset.
 */
export async function forceReseedDemoData(): Promise<void> {
  await QueueEntryCollection.removeAsync({});
  await AppointmentsCollection.removeAsync({});
  await ProviderCollection.removeAsync({});
  await PatientsCollection.removeAsync({});
  await ServicesCollection.removeAsync({});
  await CountersCollection.removeAsync({});
  await StatsCollection.removeAsync({});
  await insertDemoData();
}

async function insertDemoData(): Promise<void> {
  const now = new Date();
  const minutesAgo = (minutes: number) =>
    new Date(now.getTime() - minutes * 60 * 1000);
  const getSeededWaitTimeTotals = ({
    serviceType,
    count,
    totalDuration,
    daysAgo,
  }: {
    serviceType: "general" | "vaccination";
    count: number;
    totalDuration: number;
    daysAgo: number;
  }) => {
    if (count <= 0) {
      return {
        estimatedWaitTime: 0,
        actualWaitTime: 0,
      };
    }

    const averageDuration = totalDuration / count;
    const averageEstimatedWaitTime =
      serviceType === "general"
        ? Math.max(12, Math.round(averageDuration * 0.9 + count * 0.25))
        : Math.max(8, Math.round(averageDuration * 0.75 + count * 0.35));
    const actualWaitVariance =
      serviceType === "general"
        ? (daysAgo % 5) - 2
        : ((daysAgo + 2) % 5) - 2;
    const averageActualWaitTime = Math.max(
      0,
      averageEstimatedWaitTime + actualWaitVariance,
    );

    return {
      estimatedWaitTime: averageEstimatedWaitTime * count,
      actualWaitTime: averageActualWaitTime * count,
    };
  };

  // 2 services
  await ServicesCollection.insertAsync({
    _id: "seed-service-general",
    name: "General Consultation",
    shortcode: "GC",
    duration: 20,
    description: "General checkup and consultation",
    priority: 1,
    createdAt: minutesAgo(240),
  });

  await ServicesCollection.insertAsync({
    _id: "seed-service-vaccination",
    name: "Vaccination",
    shortcode: "VC",
    duration: 15,
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
    available: false,
    active: true,
    services: [{ id: "seed-service-general", name: "General Consultation", enabled: true }],
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
      { id: "seed-service-general", name: "General Consultation", enabled: true },
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
    available: true,
    active: true,
    services: [{ id: "seed-service-vaccination", name: "Vaccination", enabled: true }],
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

  // Daily stats — today (partial) + past 30 days, including seeded wait times.
  // GC: longer, more variable consultations (15–32 min). Peaks Mon/Tue, drops Thu/Fri.
  // VC: shorter, spikier (8–20 min). Peaks Fri, dips Mon/Tue. Different rhythm to GC.
  // Apr 22 2026 = Wednesday; days-ago 3=Sun, 4=Sat, 10=Sun, 11=Sat, etc.
  const historicalStats: Array<{
    daysAgo: number;
    gcCount: number;
    gcTotal: number;
    vcCount: number;
    vcTotal: number;
  }> = [
    // daysAgo  gcCount  gcTotal   vcCount  vcTotal    gcAvg  vcAvg
    { daysAgo:  0, gcCount:  4, gcTotal:   76, vcCount:  3, vcTotal:  54 }, // today partial  19 / 18
    { daysAgo:  1, gcCount: 20, gcTotal:  560, vcCount: 14, vcTotal: 126 }, // Tue            28 /  9
    { daysAgo:  2, gcCount: 22, gcTotal:  660, vcCount: 13, vcTotal: 117 }, // Mon            30 /  9
    { daysAgo:  3, gcCount: 12, gcTotal:  192, vcCount: 12, vcTotal: 108 }, // Sun weekend    16 /  9
    { daysAgo:  4, gcCount: 13, gcTotal:  208, vcCount: 12, vcTotal: 132 }, // Sat weekend    16 / 11
    { daysAgo:  5, gcCount: 16, gcTotal:  272, vcCount: 19, vcTotal: 342 }, // Fri            17 / 18
    { daysAgo:  6, gcCount: 15, gcTotal:  240, vcCount: 18, vcTotal: 306 }, // Thu            16 / 17
    { daysAgo:  7, gcCount: 18, gcTotal:  486, vcCount: 15, vcTotal: 180 }, // Wed            27 / 12
    { daysAgo:  8, gcCount: 21, gcTotal:  630, vcCount: 13, vcTotal: 117 }, // Tue            30 /  9
    { daysAgo:  9, gcCount: 19, gcTotal:  570, vcCount: 12, vcTotal: 108 }, // Mon            30 /  9
    { daysAgo: 10, gcCount: 12, gcTotal:  180, vcCount: 12, vcTotal:  96 }, // Sun weekend    15 /  8
    { daysAgo: 11, gcCount: 12, gcTotal:  216, vcCount: 13, vcTotal: 143 }, // Sat weekend    18 / 11
    { daysAgo: 12, gcCount: 14, gcTotal:  224, vcCount: 20, vcTotal: 400 }, // Fri            16 / 20
    { daysAgo: 13, gcCount: 15, gcTotal:  255, vcCount: 18, vcTotal: 324 }, // Thu            17 / 18
    { daysAgo: 14, gcCount: 17, gcTotal:  442, vcCount: 14, vcTotal: 168 }, // Wed            26 / 12
    { daysAgo: 15, gcCount: 20, gcTotal:  640, vcCount: 13, vcTotal: 130 }, // Tue            32 / 10
    { daysAgo: 16, gcCount: 18, gcTotal:  540, vcCount: 12, vcTotal: 108 }, // Mon            30 /  9
    { daysAgo: 17, gcCount: 12, gcTotal:  192, vcCount: 12, vcTotal: 120 }, // Sun weekend    16 / 10
    { daysAgo: 18, gcCount: 13, gcTotal:  195, vcCount: 12, vcTotal: 132 }, // Sat weekend    15 / 11
    { daysAgo: 19, gcCount: 15, gcTotal:  255, vcCount: 17, vcTotal: 306 }, // Fri            17 / 18
    { daysAgo: 20, gcCount: 16, gcTotal:  256, vcCount: 16, vcTotal: 256 }, // Thu            16 / 16
    { daysAgo: 21, gcCount: 19, gcTotal:  513, vcCount: 15, vcTotal: 165 }, // Wed            27 / 11
    { daysAgo: 22, gcCount: 22, gcTotal:  594, vcCount: 13, vcTotal: 117 }, // Tue            27 /  9
    { daysAgo: 23, gcCount: 20, gcTotal:  560, vcCount: 12, vcTotal:  96 }, // Mon            28 /  8
    { daysAgo: 24, gcCount: 12, gcTotal:  180, vcCount: 12, vcTotal: 108 }, // Sun weekend    15 /  9
    { daysAgo: 25, gcCount: 13, gcTotal:  221, vcCount: 13, vcTotal: 156 }, // Sat weekend    17 / 12
    { daysAgo: 26, gcCount: 14, gcTotal:  238, vcCount: 19, vcTotal: 361 }, // Fri            17 / 19
    { daysAgo: 27, gcCount: 16, gcTotal:  272, vcCount: 18, vcTotal: 324 }, // Thu            17 / 18
    { daysAgo: 28, gcCount: 18, gcTotal:  468, vcCount: 15, vcTotal: 180 }, // Wed            26 / 12
    { daysAgo: 29, gcCount: 21, gcTotal:  609, vcCount: 14, vcTotal: 126 }, // Tue            29 /  9
    { daysAgo: 30, gcCount: 20, gcTotal:  580, vcCount: 13, vcTotal: 117 }, // Mon            29 /  9
  ];

  for (const row of historicalStats) {
    const d = new Date(now);
    d.setUTCDate(d.getUTCDate() - row.daysAgo);
    const dayKey = d.toISOString().split("T")[0];
    const dayDate = new Date(`${dayKey}T00:00:00.000Z`);
    const generalWaitTimes = getSeededWaitTimeTotals({
      serviceType: "general",
      count: row.gcCount,
      totalDuration: row.gcTotal,
      daysAgo: row.daysAgo,
    });
    const vaccinationWaitTimes = getSeededWaitTimeTotals({
      serviceType: "vaccination",
      count: row.vcCount,
      totalDuration: row.vcTotal,
      daysAgo: row.daysAgo,
    });

    await StatsCollection.insertAsync({
      _id: `seed-service-general-${dayKey}`,
      serviceId: "seed-service-general",
      date: dayDate,
      count: row.gcCount,
      totalDuration: row.gcTotal,
      estimatedWaitTime: generalWaitTimes.estimatedWaitTime,
      actualWaitTime: generalWaitTimes.actualWaitTime,
    });

    await StatsCollection.insertAsync({
      _id: `seed-service-vaccination-${dayKey}`,
      serviceId: "seed-service-vaccination",
      date: dayDate,
      count: row.vcCount,
      totalDuration: row.vcTotal,
      estimatedWaitTime: vaccinationWaitTimes.estimatedWaitTime,
      actualWaitTime: vaccinationWaitTimes.actualWaitTime,
    });
  }

  return;
}

