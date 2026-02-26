import { Appointment, AppointmentsCollection } from "../api/appointment";
import { Service } from "../api/service";
import { WORKING_HOURS } from "../dev/settings";
import { convertStrToHrs } from "./utils";

interface AppointmentQuery {
  providerId: string;
  date: { $gte: Date; $lte: Date };
  status: { $in: string[] };
}

/**
 *
 * @param a1 - Appointment 1
 * @param a2 - Appointment 2
 * @returns True if the appointments overlap, false otherwise
 */
export function hasOverlap(
  a1: { date: Date; endDate: Date },
  a2: { date: Date; endDate: Date },
): boolean {
  return !(a1.date >= a2.endDate || a1.endDate <= a2.date);
}

/**
 * Finds the earliest available appointment slot for a given duration within a day
 *
 * @param sortedAppointments - Appointments for the day, sorted by start time
 * @param dayStart - Date object representing the start of the working day (with time set to opening time)
 * @param dayEnd - Date object representing the end of the working day (with time set to closing time)
 * @param duration - Duration of the service in minutes
 *
 * @example
 * const slot = findEarliestSlotInDay(sortedAppointments, dayStart, dayEnd, 30);
 * const slot = findEarliestSlotInDay(sortedAppointments, dayStart, dayEnd, 60);
 * const slot = findEarliestSlotInDay(sortedAppointments, dayStart, dayEnd, 90);
 */
export function findEarliestSlotInDay(
  sortedAppointments: Appointment[],
  dayStart: Date,
  dayEnd: Date,
  duration: number, // in minutes
): Date | undefined {
  let windowStart = new Date(dayStart);
  let windowEnd = new Date(dayStart.getTime() + duration * 60000);

  for (const appointment of sortedAppointments) {
    // Window has slid past end of day — no slot today
    if (windowEnd > dayEnd) return undefined;

    if (
      hasOverlap(
        { date: windowStart, endDate: windowEnd },
        { date: appointment.date, endDate: appointment.endDate },
      )
    ) {
      // Slide window to after this appointment
      windowStart = new Date(appointment.endDate);
      windowEnd = new Date(windowStart.getTime() + duration * 60000);
    } else {
      // Gap found — slot is available
      return windowStart;
    }
  }

  // No conflicts — check the window fits before end of day
  if (windowEnd <= dayEnd) return windowStart;
  return undefined;
}

/**
 * Finds the earliest available appointment slot for a provider's given service.
 * Searches from today up to a specified number of months ahead, skipping weekends.
 *
 * @param service - The service to find a slot for
 * @param providerId - The ID of the provider to search appointments for
 * @param from - The date to start searching from (inclusive)
 * @param until - The date to end the search at (exclusive)
 *
 * @example
 * const slot = await findEarliestSlot(dentalService, "providerABC", new Date(), new Date());
 */
// TODO: add consideration for breaks, and provider availability
export async function findEarliestSlot(
  service: Service,
  providerId: string,
  from: Date,
  until: Date,
): Promise<Date | undefined> {
  const currentDay = new Date(from);
  currentDay.setHours(...convertStrToHrs(WORKING_HOURS.startTime));

  // 1. Search from current date to until date
  while (currentDay < until) {
    // Skip weekends
    // TODO: add modifiers to skip specific days (e.g. provider vacations, holidays)
    const dayOfWeek = currentDay.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      currentDay.setDate(currentDay.getDate() + 1);
      currentDay.setHours(...convertStrToHrs(WORKING_HOURS.startTime));
      continue;
    }

    const dayStart = new Date(currentDay);
    const dayEnd = new Date(currentDay);
    dayEnd.setHours(...convertStrToHrs(WORKING_HOURS.endTime));

    // 2. Fetch appointments for the day
    const query: AppointmentQuery = {
      providerId: providerId,
      date: { $gte: dayStart, $lte: dayEnd },
      status: { $in: ["scheduled", "in-progress"] },
    };

    // 3. Check if there are open slots between appointments for that day
    const appointments = await AppointmentsCollection.find(query, {
      sort: { date: 1 },
    }).fetch();

    const slot = findEarliestSlotInDay(
      appointments,
      dayStart,
      dayEnd,
      service.duration,
    );

    if (slot) return slot;

    // No slot today — advance to next day
    currentDay.setDate(currentDay.getDate() + 1);
    currentDay.setHours(...convertStrToHrs(WORKING_HOURS.startTime));
  }

  // No slot found in entire search range
  return undefined;
}
