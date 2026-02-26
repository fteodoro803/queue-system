/* eslint-disable @typescript-eslint/no-unused-expressions */
import { expect } from "chai";
import {
  findEarliestSlotInDay,
  hasOverlap,
} from "/imports/utils/appointmentUtils";
import { Appointment } from "/imports/api/appointment";

// Helper function to create appointments for testing
function makeAppointment(
  startHour: number,
  startMin: number,
  endHour: number,
  endMin: number,
): Appointment {
  return {
    scheduled_start: new Date(2026, 1, 1, startHour, startMin),
    scheduled_end: new Date(2026, 1, 1, endHour, endMin),
  } as Appointment;
}

// HasOverlap Tests
describe("[UNIT] AppointmentUtils - hasOverlap()", () => {
  it("returns true for overlapping appointments", () => {
    const a1 = makeAppointment(9, 0, 9, 30); // 9:00 - 9:30
    const a2 = makeAppointment(9, 15, 9, 45); // 9:15 - 9:45
    expect(
      hasOverlap(
        { start: a1.scheduled_start, end: a1.scheduled_end },
        { start: a2.scheduled_start, end: a2.scheduled_end },
      ),
    ).to.equal(true);
  });

  it("returns false for non-overlapping appointments", () => {
    const a1 = makeAppointment(9, 0, 9, 30); // 9:00 - 9:30
    const a2 = makeAppointment(9, 30, 10, 0); // 9:30 - 10:00
    expect(
      hasOverlap(
        { start: a1.scheduled_start, end: a1.scheduled_end },
        { start: a2.scheduled_start, end: a2.scheduled_end },
      ),
    ).to.equal(false);
  });
});

// FindEarliestSlotInDay Tests
describe("[UNIT] AppointmentUtils - findEarliestSlotInDay()", () => {
  // Reusable test data
  const dayStart = new Date(2026, 1, 1, 9, 0); // 9:00am
  const dayEnd = new Date(2026, 1, 1, 17, 0); // 5:00pm
  const duration = 30; // minutes

  it("returns dayStart when no scheduled appointments exist", () => {
    const result = findEarliestSlotInDay([], dayStart, dayEnd, duration);
    expect(result).to.deep.equal(dayStart);
  });

  it("returns dayStart when first scheduled appointment is after the first slot", () => {
    const appointments = [makeAppointment(10, 0, 10, 30)];
    const result = findEarliestSlotInDay(
      appointments,
      dayStart,
      dayEnd,
      duration,
    );
    expect(result).to.deep.equal(dayStart); // 9:00 is free
  });

  it("slides past a conflicting appointment", () => {
    const appointments = [makeAppointment(9, 0, 9, 30)];
    const result = findEarliestSlotInDay(
      appointments,
      dayStart,
      dayEnd,
      duration,
    );
    expect(result).to.deep.equal(new Date(2026, 1, 1, 9, 30)); // 9:30
  });

  it("slides past multiple back-to-back appointments", () => {
    const appointments = [
      makeAppointment(9, 0, 9, 30),
      makeAppointment(9, 30, 10, 0),
    ];
    const result = findEarliestSlotInDay(
      appointments,
      dayStart,
      dayEnd,
      duration,
    );
    expect(result).to.deep.equal(new Date(2026, 1, 1, 10, 0)); // 10:00
  });

  it("returns undefined when day is fully booked", () => {
    // Fill entire day with 30 min appointments
    const appointments = [];
    for (let hour = 9; hour < 17; hour++) {
      appointments.push(makeAppointment(hour, 0, hour, 30));
      appointments.push(makeAppointment(hour, 30, hour + 1, 0));
    }
    const result = findEarliestSlotInDay(
      appointments,
      dayStart,
      dayEnd,
      duration,
    );
    expect(result).to.be.undefined;
  });

  it("returns undefined when remaining time is less than duration", () => {
    // Last slot starts at 4:45 but duration is 30 mins — would end at 5:15, past dayEnd
    const appointments = [makeAppointment(9, 0, 16, 45)];
    const result = findEarliestSlotInDay(
      appointments,
      dayStart,
      dayEnd,
      duration,
    );
    expect(result).to.be.undefined;
  });

  it("treats back-to-back appointments as non-overlapping", () => {
    // Appointment ends at exactly 9:30, next slot starts at 9:30 — should be valid
    const appointments = [makeAppointment(9, 0, 9, 30)];
    const result = findEarliestSlotInDay(
      appointments,
      dayStart,
      dayEnd,
      duration,
    );
    expect(result).to.deep.equal(new Date(2026, 1, 1, 9, 30));
  });
});
