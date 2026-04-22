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

  // Daily stats seed — today plus the past 7 days.
  // General Consultation: avg ~22 min/patient, 12–18 patients/day
  // Vaccination:          avg ~13 min/patient, 12–16 patients/day
  const historicalStats: Array<{
    daysAgo: number;
    gcCount: number;
    gcTotal: number;
    vcCount: number;
    vcTotal: number;
  }> = [
    { daysAgo: 0, gcCount: 4,  gcTotal: 80,  vcCount: 3,  vcTotal: 45  },
    { daysAgo: 1, gcCount: 14, gcTotal: 308, vcCount: 13, vcTotal: 169 },
    { daysAgo: 2, gcCount: 18, gcTotal: 396, vcCount: 16, vcTotal: 208 },
    { daysAgo: 3, gcCount: 15, gcTotal: 330, vcCount: 14, vcTotal: 182 },
    { daysAgo: 4, gcCount: 12, gcTotal: 264, vcCount: 12, vcTotal: 156 },
    { daysAgo: 5, gcCount: 17, gcTotal: 374, vcCount: 15, vcTotal: 195 },
    { daysAgo: 6, gcCount: 13, gcTotal: 286, vcCount: 12, vcTotal: 156 },
    { daysAgo: 7, gcCount: 16, gcTotal: 352, vcCount: 14, vcTotal: 182 },
  ];

  for (const row of historicalStats) {
    const d = new Date(now);
    d.setUTCDate(d.getUTCDate() - row.daysAgo);
    const dayKey = d.toISOString().split("T")[0];
    const dayDate = new Date(`${dayKey}T00:00:00.000Z`);

    await StatsCollection.insertAsync({
      _id: `seed-service-general-${dayKey}`,
      serviceId: "seed-service-general",
      date: dayDate,
      count: row.gcCount,
      totalDuration: row.gcTotal,
    });

    await StatsCollection.insertAsync({
      _id: `seed-service-vaccination-${dayKey}`,
      serviceId: "seed-service-vaccination",
      date: dayDate,
      count: row.vcCount,
      totalDuration: row.vcTotal,
    });
  }

  return;
}

