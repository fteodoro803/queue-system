import { expect } from "chai";
import { hasOverlap } from "/imports/utils/appointmentUtils";
import { Appointment } from "/imports/api/appointment";

// Helper function to create appointments for testing
function makeAppointment(
  startHour: number,
  startMin: number,
  endHour: number,
  endMin: number,
): Appointment {
  return {
    date: new Date(2026, 1, 18, startHour, startMin),
    endDate: new Date(2026, 1, 18, endHour, endMin),
  } as Appointment;
}

// HasOverlap Tests
describe("AppointmentUtils - hasOverlap", () => {
  it("returns true for overlapping appointments", () => {
    const a1 = makeAppointment(9, 0, 9, 30); // 9:00 - 9:30
    const a2 = makeAppointment(9, 15, 9, 45); // 9:15 - 9:45
    expect(hasOverlap(a1, a2)).to.equal(true);
  });

  it("returns false for non-overlapping appointments", () => {
    const a1 = makeAppointment(9, 0, 9, 30); // 9:00 - 9:30
    const a2 = makeAppointment(9, 30, 10, 0); // 9:30 - 10:00
    expect(hasOverlap(a1, a2)).to.equal(false);
  });
});
