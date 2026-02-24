import { Appointment, AppointmentsCollection } from "../api/appointment";
import { Service } from "../api/service";
import { TEST_DATE, WORKING_HOURS } from "../dev/settings";
import { convertStrToHrs, hasOverlap } from "./utils";

interface AppointmentQuery {
  serviceId: string;
  date: { $gte: Date; $lte: Date };
  status: { $in: string[] };
  providerId?: string;
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
 * Finds the earliest available appointment slot for a given service.
 * Searches from today up to a specified number of months ahead, skipping weekends.
 *
 * @param service - The service to find a slot for
 * @param providerId - Optional. If provided, only searches appointments for this provider
 * @param monthsAhead - Optional. The number of months ahead to search for available slots (default is 3)
 * @returns The earliest available Date, or undefined if no slot is found
 *
 * @example
 * const slot = await findEarliestSlot(dentalService);
 * const slot = await findEarliestSlot(dentalService, "providerABC");
 * const slot = await findEarliestSlot(dentalService, undefined, 6); // search 6 months ahead
 */
export async function findEarliestSlot(
  service: Service,
  providerId?: string,
  monthsAhead: number = 3,
): Promise<Date | undefined> {
  const searchFrom = TEST_DATE ?? new Date();
  const searchUntil = new Date(searchFrom);
  searchUntil.setMonth(searchUntil.getMonth() + monthsAhead);

  const currentDay = new Date(searchFrom);
  currentDay.setHours(...convertStrToHrs(WORKING_HOURS.startTime));

  // 1. Search from current date until searchUntil date
  while (currentDay < searchUntil) {
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
      serviceId: service._id,
      date: { $gte: dayStart, $lte: dayEnd },
      status: { $in: ["scheduled", "in-progress"] },
    };

    // Add provider filter if specified (for provider-specific services)
    if (providerId) {
      query.providerId = providerId;
    }

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
