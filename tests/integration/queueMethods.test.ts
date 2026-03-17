// tests/queueEntryMethods.test.ts
import { assert } from "chai";
import { Meteor } from "meteor/meteor";
import { QueueEntryCollection } from "/imports/api/queueEntry";
import {
  enqueue,
  startService,
  completeService,
  cancelService,
} from "/imports/api/queueEntryMethods";
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

const now = new Date();

if (Meteor.isServer) {
  describe("[INTEGRATION] queueEntryMethods", function () {
    // Clean up before each test
    beforeEach(async () => {
      await QueueEntryCollection.removeAsync({});
    });

    // -------------------------
    // enqueue
    // -------------------------
    describe("enqueue()", function () {
      it("should add a patient to the queue with position 1 when queue is empty", async () => {
        const id = await enqueue(
          { patient: mockPatient, service: mockService },
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
          { patient: mockPatient, service: mockService },
          now,
        );
        const id2 = await enqueue(
          { patient: mockPatient, service: mockService },
          now,
        );

        const entry1 = await QueueEntryCollection.findOneAsync(id1);
        const entry2 = await QueueEntryCollection.findOneAsync(id2);

        assert.equal(entry1?.position, 1);
        assert.equal(entry2?.position, 2);
      });

      it("should generate a display ID with the service shortcode", async () => {
        const id = await enqueue(
          { patient: mockPatient, service: mockService },
          now,
        );
        const entry = await QueueEntryCollection.findOneAsync(id);

        assert.match(entry?.displayId ?? "", /^GS-\d{2}$/);
      });
    });

    // -------------------------
    // startService
    // -------------------------
    describe("startService()", function () {
      it("should set status to in-progress and position to null", async () => {
        const id = await enqueue(
          { patient: mockPatient, service: mockService },
          now,
        );
        await startService(id, now);

        const entry = await QueueEntryCollection.findOneAsync(id);
        assert.equal(entry?.status, "in-progress");
        assert.isNull(entry?.position);
        assert.exists(entry?.start);
      });

      it("should shift the next entry to position 1", async () => {
        const id1 = await enqueue(
          { patient: mockPatient, service: mockService },
          now,
        );
        const id2 = await enqueue(
          { patient: mockPatient, service: mockService },
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
      it("should set status to completed and clear position", async () => {
        const id = await enqueue(
          { patient: mockPatient, service: mockService },
          now,
        );
        await startService(id, now);
        await completeService(id, now);

        const entry = await QueueEntryCollection.findOneAsync(id);
        assert.equal(entry?.status, "completed");
        assert.isNull(entry?.position);
        assert.exists(entry?.end);
      });

      it("should throw if entry has no position (already dequeued)", async () => {
        const id = await enqueue(
          { patient: mockPatient, service: mockService },
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
          { patient: mockPatient, service: mockService },
          now,
        );
        await cancelService(id, now);

        const entry = await QueueEntryCollection.findOneAsync(id);
        assert.equal(entry?.status, "cancelled");
        assert.isNull(entry?.position);
      });

      it("should shift positions of entries behind the cancelled one", async () => {
        const id1 = await enqueue(
          { patient: mockPatient, service: mockService },
          now,
        );
        const id2 = await enqueue(
          { patient: mockPatient, service: mockService },
          now,
        );
        const id3 = await enqueue(
          { patient: mockPatient, service: mockService },
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
  });
}
