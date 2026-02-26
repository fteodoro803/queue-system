/* eslint-disable @typescript-eslint/no-unused-expressions */
import { expect } from "chai";
import { AppointmentsCollection } from "/imports/api/appointment";
import { Service } from "/imports/api/service";
import { findEarliestSlot } from "/imports/utils/appointmentUtils";
import { Provider } from "/imports/api/provider";
import { Meteor } from "meteor/meteor";
import {
  AppointmentData,
  insertAppointment,
} from "/imports/api/appointmentMethods";
import { Patient } from "/imports/api/patient";

if (Meteor.isServer) {
  describe("[INTEGRATION] appointmentUtils - findEarliestSlot()", function () {
    // Mocha default timeout is 2000ms — async DB tests need more
    this.timeout(10000);

    // Reusable Test Data
    const testService = { _id: "service1", duration: 30 } as Service;
    const testProvider = { _id: "provider1" } as Provider;

    // Search window: Wed Feb 18 → Wed Feb 25 (one week)
    // Feb 18 is a Wednesday — predictable, known day of week
    const from = new Date(2026, 1, 18); // Wed Feb 18
    const until = new Date(2026, 1, 25); // Wed Feb 25

    beforeEach(async () => {
      // Clean slate before each test
      await AppointmentsCollection.removeAsync({});
    });

    after(async () => {
      // Final cleanup
      await AppointmentsCollection.removeAsync({});
    });

    // Helper Functions
    // Creates and inserts an appointment for the test provider on a given day
    async function seedAppointment(
      year: number,
      month: number,
      day: number,
      startHour: number,
      startMin: number,
      endHour: number,
      endMin: number,
    ) {
      const data = {
        service: testService,
        serviceId: testService._id,
        provider: testProvider,
        providerId: testProvider._id,
        patient: { _id: "patient1" } as Patient, // patient details not relevant for this test
        date: new Date(year, month, day, startHour, startMin),
        endDate: new Date(year, month, day, endHour, endMin),
        status: "scheduled",
      } as AppointmentData;

      await insertAppointment(data);
    }

    // Fills an entire day with back-to-back 30 min appointments (9am–5pm)
    async function fillDay(year: number, month: number, day: number) {
      for (let hour = 9; hour < 17; hour++) {
        await seedAppointment(year, month, day, hour, 0, hour, 30);
        await seedAppointment(year, month, day, hour, 30, hour + 1, 0);
      }
    }

    it("returns 9am on the first day when no appointments exist", async () => {
      const result = await findEarliestSlot(
        testService,
        testProvider._id,
        from,
        until,
      );
      expect(result).to.deep.equal(new Date(2026, 1, 18, 9, 0));
    });

    it("slides past a single appointment at 9am", async () => {
      await seedAppointment(2026, 1, 18, 9, 0, 9, 30);
      const result = await findEarliestSlot(
        testService,
        testProvider._id,
        from,
        until,
      );
      expect(result).to.deep.equal(new Date(2026, 1, 18, 9, 30));
    });

    it("slides past multiple back-to-back appointments", async () => {
      await seedAppointment(2026, 1, 18, 9, 0, 9, 30);
      await seedAppointment(2026, 1, 18, 9, 30, 10, 0);
      await seedAppointment(2026, 1, 18, 10, 0, 10, 30);
      const result = await findEarliestSlot(
        testService,
        testProvider._id,
        from,
        until,
      );
      expect(result).to.deep.equal(new Date(2026, 1, 18, 10, 30));
    });

    it("skips to next weekday when today is fully booked", async () => {
      await fillDay(2026, 1, 18); // fill Wednesday Feb 18
      const result = await findEarliestSlot(
        testService,
        testProvider._id,
        from,
        until,
      );
      // Next day is Thursday Feb 19
      expect(result).to.deep.equal(new Date(2026, 1, 19, 9, 0));
    });

    it("returns undefined when no slot exists in the entire range", async () => {
      // Fill every weekday in the search window
      await fillDay(2026, 1, 18); // Wed
      await fillDay(2026, 1, 19); // Thu
      await fillDay(2026, 1, 20); // Fri
      await fillDay(2026, 1, 23); // Mon
      await fillDay(2026, 1, 24); // Tue
      const result = await findEarliestSlot(
        testService,
        testProvider._id,
        from,
        until,
      );
      expect(result).to.be.undefined;
    });

    it("only considers appointments for the given provider", async () => {
      // Appointment for a different provider at 9am — should not affect result
      const otherProvider = { _id: "different-provider" } as Provider;

      const data = {
        service: testService,
        serviceId: testService._id,
        provider: otherProvider,
        providerId: otherProvider._id,
        patient: { _id: "patient1" } as Patient, // patient details not relevant for this test
        date: new Date(2026, 1, 18, 9, 0),
        endDate: new Date(2026, 1, 18, 9, 30),
        status: "scheduled",
      } as AppointmentData;

      await insertAppointment(data);

      const result = await findEarliestSlot(
        testService,
        testProvider._id,
        from,
        until,
      );
      // Our provider is free — should still return 9am
      expect(result).to.deep.equal(new Date(2026, 1, 18, 9, 0));
    });

    it("ignores cancelled appointments", async () => {
      // Cancelled appointment at 9am — should not block the slot
      const data = {
        service: testService,
        serviceId: testService._id,
        provider: testProvider,
        providerId: testProvider._id,
        patient: { _id: "patient1" } as Patient,
        date: new Date(2026, 1, 18, 9, 0),
        endDate: new Date(2026, 1, 18, 9, 30),
        status: "cancelled",
      } as AppointmentData;

      await insertAppointment(data);

      const result = await findEarliestSlot(
        testService,
        testProvider._id,
        from,
        until,
      );
      expect(result).to.deep.equal(new Date(2026, 1, 18, 9, 0));
    });

    it("returns undefined when from is after until", async () => {
      const result = await findEarliestSlot(
        testService,
        testProvider._id,
        until,
        from,
      );
      expect(result).to.be.undefined;
    });
  });
}
