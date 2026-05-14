import { Meteor } from "meteor/meteor";
import { QueueEntry, QueueEntryCollection } from "/imports/api/queueEntry";
import { Patient, PatientsCollection } from "/imports/api/patient";
import { Service } from "/imports/api/service";
import { CountersCollection } from "/imports/api/counters";
import {
  selectProvider,
  setProviderAvailability,
} from "/imports/api/providerMethods";
import { updateStats } from "/imports/api/statsMethods";
import { normaliseString } from "/imports/utils/utils";

export interface QueueEntryData {
  patient: Patient;
  service: Service;
}

export type CheckInResult = {
  id: string;
  result:
    | "success"
    | "already-checked-in"
    | "entry-not-found"
    | "unknown-error";
  time: Date;
};

// Client-Called methods
Meteor.methods({
  // Inserts entry to queue, and calculates its position
  async "queueEntry.enqueue"(data: QueueEntryData, time: Date) {
    // 1. Get the current max position in the queue, for respective service
    const maxPositionEntry: QueueEntry | undefined =
      await QueueEntryCollection.findOneAsync(
        {
          position: { $ne: null },
          serviceId: data.service._id,
          status: { $in: ["waiting", "ready"] },
        },
        { sort: { position: -1 } },
      );

    // 2. Set the position of the entry to max + 1 (or 1 if no entries in the queue)
    const newPosition = maxPositionEntry
      ? (maxPositionEntry.position || 0) + 1
      : 1;

    // 3. Generate display ID
    const displayId = await generateDisplayId(data.service);

    // 4. Insert the entry into queue and return
    return QueueEntryCollection.insertAsync({
      displayId: normaliseString(displayId),
      patientId: data.patient._id,
      serviceId: data.service._id,
      providerId: null,
      position: newPosition,
      status: "waiting",
      initialEstimatedWaitTime: null, // placeholder
      readyAt: null,
      start: null, // Start time will be set once the service is started
      end: null, // End time will be set after the service is completed
      createdAt: time,
    });
  },

  // Set initialEstimatedWaitTime
  async "queueEntry.setInitialEstimatedWaitTime"(id: string, time: number) {
    await QueueEntryCollection.updateAsync(id, {
      $set: {
        initialEstimatedWaitTime: time,
      },
    });
  },

  // Check in
  async "queueEntry.markAsReady"(
    id: string,
    time: Date,
  ): Promise<CheckInResult> {
    const entry: QueueEntry | undefined =
      await QueueEntryCollection.findOneAsync(id);

    // 1. Early Returns
    // Entry doesn't exist or is not in a state that can be checked-in
    if (!entry || (entry.status !== "waiting" && entry.status !== "ready")) {
      return { id, result: "entry-not-found", time };
    }

    // Already ready, no update needed
    if (entry.status === "ready") {
      return { id, result: "already-checked-in", time };
    }

    // 2. Mark the entry as ready
    const updated = await QueueEntryCollection.updateAsync(id, {
      $set: {
        readyAt: time,
        status: "ready",
      },
    });

    // No update
    if (updated === 0) {
      return { id, result: "unknown-error", time };
    }

    // Successfully marked as ready
    return { id, result: "success", time };
  },

  // Starts a Service
  async "queueEntry.startService"(id: string, time: Date) {
    const entry: QueueEntry | undefined =
      await QueueEntryCollection.findOneAsync(id);
    if (!entry) {
      throw new Meteor.Error("Queue entry not found");
    }

    // Only entries that are in the queue (position > 0) can be started
    if (entry.position === null || entry.position <= 0) {
      throw new Meteor.Error("Invalid queue entry position");
    }

    // 1. Update the status of the entry
    await QueueEntryCollection.updateAsync(id, {
      $set: {
        status: "in-progress",
        position: null, // Set position to null to indicate it's being served
        start: time,
      },
    });

    // 2. Update positions of entries behind the dequeued entry
    await updatePositions(entry);

    // 3. Select provider and mark them as unavailable
    const providerId = await selectProvider(entry.serviceId);
    if (providerId) {
      await setProviderAvailability(providerId, false);
      await QueueEntryCollection.updateAsync(id, {
        $set: { providerId },
      });
    }
  },

  // Completes a Service and update stats
  async "queueEntry.completeService"(id: string, time: Date) {
    const entry: QueueEntry | undefined =
      await QueueEntryCollection.findOneAsync(id);
    if (!entry) {
      throw new Meteor.Error("Queue entry not found");
    }

    // Only entries that are in-progress can be completed
    if (!entry.start || entry.status !== "in-progress") {
      throw new Meteor.Error(
        "Cannot complete a service that has not been started/is not in-progress",
      );
    }

    // 1. Update the status of the entry
    await QueueEntryCollection.updateAsync(id, {
      $set: {
        status: "completed",
        end: time,
      },
    });

    // 2. Select provider and mark them as available
    const providerId = entry.providerId;
    if (providerId) {
      await setProviderAvailability(providerId, true);
    }

    // 3. Update Service Analytics
    const startTime: Date = entry.start;
    const endTime: Date = time;

    const estimatedWaitTime: number | undefined =
      entry.initialEstimatedWaitTime ?? undefined;
    const actualWaitTime: number =
      (startTime.getTime() - entry.createdAt.getTime()) / 60000; // in minutes

    await updateStats({
      serviceId: entry.serviceId,
      date: entry.start,
      inc: {
        numCompletedAppointments: 1,
        estimatedWaitTime: estimatedWaitTime,
        actualWaitTime: actualWaitTime,
        startTime,
        endTime,
      },
    });
  },

  // Cancels a Service
  async "queueEntry.cancelService"(id: string, time: Date) {
    const entry: QueueEntry | undefined =
      await QueueEntryCollection.findOneAsync(id);
    if (!entry) {
      throw new Meteor.Error("Queue entry not found");
    }

    // 1. Update the status of the entry
    await QueueEntryCollection.updateAsync(id, {
      $set: {
        status: "cancelled",
        position: null, // Set position to null to indicate it's being served
      },
    });

    // 2. Update positions of entries behind the dequeued entry
    await updatePositions(entry);

    // 3. Update stats
    await updateStats({
      serviceId: entry.serviceId,
      date: time,
      inc: {
        numCancellations: 1,
      },
    });
  },
});

// Enqueues a patient to a service queue
export async function enqueue(
  data: QueueEntryData,
  time: Date,
): Promise<string> {
  return Meteor.callAsync("queueEntry.enqueue", data, time);
}

// Sets initial estimated wait time for a queue entry
export async function setInitialEstimatedWaitTime(
  id: string,
  time: number,
): Promise<void> {
  await Meteor.callAsync("queueEntry.setInitialEstimatedWaitTime", id, time);
}

// Checks-in a Patient, and marks them as Ready
export async function checkIn(id: string, time: Date): Promise<CheckInResult> {
  return Meteor.callAsync("queueEntry.markAsReady", id, time);
}

// Starts a service for a queue entry
export async function startService(id: string, time: Date): Promise<void> {
  await Meteor.callAsync("queueEntry.startService", id, time);
}

// Completes a service for a queue entry and removes it from the queue
export async function completeService(id: string, time: Date): Promise<void> {
  await Meteor.callAsync("queueEntry.completeService", id, time);
}

// Cancels a queue entry
export async function cancelService(id: string, time: Date): Promise<void> {
  await Meteor.callAsync("queueEntry.cancelService", id, time);
}

/** Helper function to update positions of queue entries behind a given entry */
async function updatePositions(entry: QueueEntry): Promise<void> {
  // If the entry is not in the queue, no need to update positions
  if (entry.position === null || entry.position <= 0) return;

  await QueueEntryCollection.updateAsync(
    // 1. filter for entries of the same service that are behind the current entry in the queue
    {
      serviceId: entry.serviceId,
      $and: [{ position: { $gt: entry.position } }, { position: { $gt: 1 } }],
    },

    // 2. decrement positions of entries behind the current entry
    { $inc: { position: -1 } },

    // 3. all matches
    { multi: true },
  );
}

// Generate Display ID
// TODO: fix potential for race condition between upsert and findOne
// TODO: what if two services have the same initials? (e.g., "General Consultation" and "General Checkup" both being "GE")
async function generateDisplayId(service: Service): Promise<string> {
  // 1. Get count from Counters Collection
  const counter = await CountersCollection.findOneAsync({
    // _id: service._id,
    _id: "placeholderId",
  });
  const currentCount = counter?.count ?? 0;

  // 2. Wrap to 1 after 99
  const nextNum = currentCount >= 99 ? 1 : currentCount + 1;

  // 3. Update count in Counters Collection
  await CountersCollection.upsertAsync(
    // { _id: service._id },
    { _id: "placeholderId" },
    { $set: { count: nextNum } },
  );

  // 4. Combine initials and count to generate ID (e.g., "AB-12")
  const numStr = `${String(nextNum).padStart(2, "0")}`;
  return `${service.shortcode}-${numStr}`;
}

// User Check-in
export async function patientSelfCheckIn({
  displayId,
  name,
  time,
}: {
  displayId: string;
  name: string;
  time: Date;
}): Promise<CheckInResult> {
  // 1. Normalise inputs
  const normalisedName: string = normaliseString(name);
  const normalisedDisplayId: string = normaliseString(displayId);

  // 2. Resolve patientId from arguments or context (e.g., from logged-in user)
  const patient = await PatientsCollection.findOneAsync({
    name: normalisedName,
  });

  if (!patient) {
    console.log(`Patient with name '${name}'->'${normalisedName}' not found`);
    return { id: "", result: "entry-not-found", time };
  }

  const entry = await QueueEntryCollection.findOneAsync({
    displayId: normalisedDisplayId,
    patientId: patient._id,
    status: { $in: ["waiting", "ready"] },
  });

  if (!entry) {
    console.log(
      `Queue entry with displayId ${displayId}->${normalisedDisplayId} for patient ${name}->${normalisedName} not found`,
    );
    return { id: "", result: "entry-not-found", time };
  }

  // 3. Mark the entry as ready (i.e., check-in), if the patient has an active queue entry
  return await checkIn(entry._id, time);
}
