// tests/queueEntryMethods.test.ts
import { assert } from "chai";
import { Meteor } from "meteor/meteor";
import { QueueEntryCollection } from "/imports/api/queueEntry";
import { ProviderCollection } from "/imports/api/provider";
import { PatientsCollection } from "/imports/api/patient";
import {
  enqueue,
  checkIn,
  patientSelfCheckIn,
  startService,
  completeService,
  cancelService,
} from "/imports/api/queueEntryMethods";
import { insertProvider, updateProvider } from "/imports/api/providerMethods";
import { Patient } from "/imports/api/patient";
import { Service } from "/imports/api/service";

// Stub patient and service for tests
const mockPatient: Patient = {
  _id: "patient-1",
  name: "Test Patient",
  email: "test@test.com",
  number: "0900000000",
  createdAt: new Date(),
};

const mockService: Service = {
  _id: "service-1",
  name: "General Service",
  shortcode: "GS",
  duration: 30,
  description: "Test service",
  priority: 1,
  createdAt: new Date(),
};

const now: Date = new Date();

async function seedAvailableProviderForMockService(): Promise<string> {
  const providerId = await insertProvider({
    name: "Queue Test Provider",
    services: [{ id: mockService._id, name: mockService.name, enabled: true }],
  });

  await updateProvider(providerId, { available: true });
  return providerId;
}

if (Meteor.isServer) {
  describe("[INTEGRATION] queueEntryMethods", function () {
    // Clean up before each test
    beforeEach(async () => {
      await QueueEntryCollection.removeAsync({});
      await ProviderCollection.removeAsync({});
      await PatientsCollection.removeAsync({});
    });

    // -------------------------
    // enqueue
    // -------------------------
    describe("enqueue()", function () {
      it("should add a patient to the queue with position 1 when queue is empty", async () => {
        const id = await enqueue(
          {
            patient: mockPatient,
            service: mockService,
          },
          now,
        );

        const entry = await QueueEntryCollection.findOneAsync(id);
        assert.exists(entry);
        assert.equal(entry?.position, 1);
        assert.equal(entry?.status, "waiting");
        assert.equal(entry?.patientId, mockPatient._id);
        assert.equal(entry?.serviceId, mockService._id);
      });

      it("should assign incrementing positions for multiple entries", async () => {
        const id1 = await enqueue(
          {
            patient: mockPatient,
            service: mockService,
          },
          now,
        );
        const id2 = await enqueue(
          {
            patient: mockPatient,
            service: mockService,
          },
          now,
        );

        const entry1 = await QueueEntryCollection.findOneAsync(id1);
        const entry2 = await QueueEntryCollection.findOneAsync(id2);

        assert.equal(entry1?.position, 1);
        assert.equal(entry2?.position, 2);
      });

      it("should generate a display ID with the service shortcode", async () => {
        const id = await enqueue(
          {
            patient: mockPatient,
            service: mockService,
          },
          now,
        );
        const entry = await QueueEntryCollection.findOneAsync(id);

        assert.match(entry?.displayId ?? "", /^gs-\d{2}$/);
      });
    });

    // -------------------------
    // startService
    // -------------------------
    describe("startService()", function () {
      it("should set status to in-progress, clear position, and assign an available provider", async () => {
        const providerId = await seedAvailableProviderForMockService();
        const id = await enqueue(
          {
            patient: mockPatient,
            service: mockService,
          },
          now,
        );
        await startService(id, now);

        const entry = await QueueEntryCollection.findOneAsync(id);
        const provider = await ProviderCollection.findOneAsync(providerId);
        assert.equal(entry?.status, "in-progress");
        assert.isNull(entry?.position);
        assert.exists(entry?.start);
        assert.equal(entry?.providerId, providerId);
        assert.equal(provider?.available, false);
      });

      it("should shift the next entry to position 1", async () => {
        await seedAvailableProviderForMockService();
        const id1 = await enqueue(
          {
            patient: mockPatient,
            service: mockService,
          },
          now,
        );
        const id2 = await enqueue(
          {
            patient: mockPatient,
            service: mockService,
          },
          now,
        );

        await startService(id1, now);

        const entry2 = await QueueEntryCollection.findOneAsync(id2);
        assert.equal(entry2?.position, 1);
      });

      it("should throw if the entry does not exist", async () => {
        try {
          await startService("nonexistent-id", now);
          assert.fail("Should have thrown");
        } catch (e) {
          assert.instanceOf(e, Meteor.Error);
        }
      });
    });

    // -------------------------
    // completeService
    // -------------------------
    describe("completeService()", function () {
      it("should set status to completed, keep position null, and make the provider available again", async () => {
        const providerId = await seedAvailableProviderForMockService();
        const id = await enqueue(
          {
            patient: mockPatient,
            service: mockService,
          },
          now,
        );
        await startService(id, now);
        await completeService(id, now);

        const entry = await QueueEntryCollection.findOneAsync(id);
        const provider = await ProviderCollection.findOneAsync(providerId);
        assert.equal(entry?.status, "completed");
        assert.isNull(entry?.position);
        assert.exists(entry?.end);
        assert.equal(entry?.providerId, providerId);
        assert.equal(provider?.available, true);
      });

      it("should throw if entry is cancelled or completed", async () => {
        await seedAvailableProviderForMockService();
        const id = await enqueue(
          {
            patient: mockPatient,
            service: mockService,
          },
          now,
        );
        await startService(id, now);
        await completeService(id, now);

        try {
          await completeService(id, now); // completing again should throw
          assert.fail("Should have thrown");
        } catch (e) {
          assert.instanceOf(e, Meteor.Error);
        }
      });
    });

    // -------------------------
    // cancelService
    // -------------------------
    describe("cancelService()", function () {
      it("should set status to cancelled and clear position", async () => {
        const id = await enqueue(
          {
            patient: mockPatient,
            service: mockService,
          },
          now,
        );
        await cancelService(id, now);

        const entry = await QueueEntryCollection.findOneAsync(id);
        assert.equal(entry?.status, "cancelled");
        assert.isNull(entry?.position);
      });

      it("should shift positions of entries behind the cancelled one", async () => {
        const id1 = await enqueue(
          {
            patient: mockPatient,
            service: mockService,
          },
          now,
        );
        const id2 = await enqueue(
          {
            patient: mockPatient,
            service: mockService,
          },
          now,
        );
        const id3 = await enqueue(
          {
            patient: mockPatient,
            service: mockService,
          },
          now,
        );

        await cancelService(id1, now);

        const entry2 = await QueueEntryCollection.findOneAsync(id2);
        const entry3 = await QueueEntryCollection.findOneAsync(id3);

        assert.equal(entry2?.position, 1);
        assert.equal(entry3?.position, 2);
      });

      it("should throw if the entry does not exist", async () => {
        try {
          await cancelService("nonexistent-id", now);
          assert.fail("Should have thrown");
        } catch (e) {
          assert.instanceOf(e, Meteor.Error);
        }
      });
    });

    // -------------------------
    // checkIn
    // -------------------------
    describe("checkIn()", function () {
      it("returns success and marks a waiting entry as ready", async () => {
        const entryId = await QueueEntryCollection.insertAsync({
          displayId: "gc-01",
          patientId: "patient-checkin-1",
          serviceId: mockService._id,
          providerId: null,
          position: 1,
          status: "waiting",
          initialEstimatedWaitTime: null,
          readyAt: null,
          start: null,
          end: null,
          createdAt: now,
        });

        const result = await checkIn(entryId, now);
        const updatedEntry = await QueueEntryCollection.findOneAsync(entryId);

        assert.equal(result.result, "success");
        assert.equal(result.id, entryId);
        assert.equal(updatedEntry?.status, "ready");
        assert.deepEqual(updatedEntry?.readyAt, now);
      });

      it("returns already-checked-in when entry is already ready", async () => {
        const entryId = await QueueEntryCollection.insertAsync({
          displayId: "gc-02",
          patientId: "patient-checkin-2",
          serviceId: mockService._id,
          providerId: null,
          position: 1,
          status: "ready",
          initialEstimatedWaitTime: null,
          readyAt: now,
          start: null,
          end: null,
          createdAt: now,
        });

        const result = await checkIn(entryId, new Date(now.getTime() + 1000));

        assert.equal(result.result, "already-checked-in");
      });

      it("returns entry-not-found when entry does not exist", async () => {
        const result = await checkIn("missing-entry-id", now);

        assert.equal(result.result, "entry-not-found");
      });
    });

    // -------------------------
    // patientSelfCheckIn
    // -------------------------
    describe("patientSelfCheckIn()", function () {
      it("finds by normalized name and display ID then checks in successfully", async () => {
        const patientId = await PatientsCollection.insertAsync({
          name: "taylor ong",
          email: null,
          number: null,
          avatar: null,
          createdAt: now,
        });

        await QueueEntryCollection.insertAsync({
          displayId: "gc-03",
          patientId,
          serviceId: mockService._id,
          providerId: null,
          position: 1,
          status: "waiting",
          initialEstimatedWaitTime: null,
          readyAt: null,
          start: null,
          end: null,
          createdAt: now,
        });

        const result = await patientSelfCheckIn({
          displayId: "  GC-03  ",
          name: "  Taylor Ong  ",
          time: now,
        });

        assert.equal(result.result, "success");
      });

      it("returns already-checked-in when matched entry is already ready", async () => {
        const patientId = await PatientsCollection.insertAsync({
          name: "taylor ong",
          email: null,
          number: null,
          avatar: null,
          createdAt: now,
        });

        await QueueEntryCollection.insertAsync({
          displayId: "gc-04",
          patientId,
          serviceId: mockService._id,
          providerId: null,
          position: 1,
          status: "ready",
          initialEstimatedWaitTime: null,
          readyAt: now,
          start: null,
          end: null,
          createdAt: now,
        });

        const result = await patientSelfCheckIn({
          displayId: "GC-04",
          name: "Taylor Ong",
          time: now,
        });

        assert.equal(result.result, "already-checked-in");
      });

      it("returns entry-not-found when patient is missing", async () => {
        const result = await patientSelfCheckIn({
          displayId: "gc-05",
          name: "Unknown Person",
          time: now,
        });

        assert.equal(result.result, "entry-not-found");
      });

      it("returns entry-not-found when queue entry does not match patient/displayId", async () => {
        const patientId = await PatientsCollection.insertAsync({
          name: "taylor ong",
          email: null,
          number: null,
          avatar: null,
          createdAt: now,
        });

        await QueueEntryCollection.insertAsync({
          displayId: "gc-06",
          patientId,
          serviceId: mockService._id,
          providerId: null,
          position: 1,
          status: "waiting",
          initialEstimatedWaitTime: null,
          readyAt: null,
          start: null,
          end: null,
          createdAt: now,
        });

        const result = await patientSelfCheckIn({
          displayId: "gc-07",
          name: "taylor ong",
          time: now,
        });

        assert.equal(result.result, "entry-not-found");
      });
    });
  });
}
