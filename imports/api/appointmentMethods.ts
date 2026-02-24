import { Meteor } from "meteor/meteor";
import { AppointmentsCollection } from "/imports/api/appointment";
import { Service, ServicesCollection } from "./service";
import { Patient } from "./patient";
import { Provider } from "./provider";
import { convertStrToHrs, hasOverlap } from "../utils/utils";
import { TEST_DATE, WORKING_HOURS } from "../dev/settings";

export const APPOINTMENT_STATES = [
  "scheduled",
  "in-progress",
  "completed",
  "cancelled",
] as const;

export interface AppointmentData {
  service: Service;
  provider: Provider;
  patient: Patient;
  date: Date;
  status: (typeof APPOINTMENT_STATES)[number];
}

interface AppointmentQuery {
  serviceId: string;
  date: { $gte: Date; $lte: Date };
  status: { $in: string[] };
  providerId?: string;
}

// Client-Called methods
Meteor.methods({
  // Adds appointment to the database
  "appointments.insert"(data: AppointmentData) {
    return AppointmentsCollection.insertAsync({
      serviceId: data.service._id,
      service: data.service,
      providerId: data.provider._id,
      provider: data.provider,
      patientId: data.patient._id,
      patient: data.patient,
      date: data.date,
      endDate: new Date(data.date.getTime() + data.service.duration * 60000), // calculate end date based on service duration
      status: data.status,
      createdAt: new Date(),
    });
  },

  // Deletes appointment from the database
  "appointments.remove"(id: string) {
    return AppointmentsCollection.removeAsync(id);
  },

  // Marks appointment as complete
  "appointments.complete"(id: string) {
    return AppointmentsCollection.updateAsync(id, {
      $set: { status: "completed" },
    });
  },

  // Marks appointment as in-progress
  "appointments.start"(id: string) {
    return AppointmentsCollection.updateAsync(id, {
      $set: { status: "in-progress" },
    });
  },

  // Marks appointment as cancelled
  "appointments.cancel"(id: string) {
    return AppointmentsCollection.updateAsync(id, {
      $set: { status: "cancelled" },
    });
  },

  // Marks appointment as scheduled
  "appointments.scheduled"(id: string) {
    return AppointmentsCollection.updateAsync(id, {
      $set: { status: "scheduled" },
    });
  },

  // Get earliest appointment time for a given service, and optionally a provider
  // TODO: do proper tests on this. I know this works within a day, but need to verify it works across days, and with edge cases (e.g. appointments that end at closing time)
  async "appointments.getEarliest"(
    serviceId: string,
    providerId?: string,
  ): Promise<Date | undefined> {
    const service = await ServicesCollection.findOneAsync(serviceId);
    if (!service) return undefined;

    const searchFrom = TEST_DATE ?? new Date();
    const searchUntil = new Date(searchFrom);
    searchUntil.setMonth(searchUntil.getMonth() + 3);

    // 1. Start searching from the beginning of the current day
    const currentDay = new Date(searchFrom);
    currentDay.setHours(...convertStrToHrs(WORKING_HOURS.startTime));

    while (currentDay < searchUntil) {
      // Skip weekends
      // TODO: add modifiers to skip specific days (e.g. provider vacations, holidays, etc.)
      const dayOfWeek = currentDay.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        currentDay.setDate(currentDay.getDate() + 1);
        currentDay.setHours(...convertStrToHrs(WORKING_HOURS.startTime));
        continue;
      }

      const dayStart = new Date(currentDay);
      const dayEnd = new Date(currentDay);
      dayEnd.setHours(...convertStrToHrs(WORKING_HOURS.endTime));

      // 2. Search for appointments for this service (and provider, if specified) on this day, sorted by date
      const query: AppointmentQuery = {
        serviceId,
        date: { $gte: dayStart, $lte: dayEnd },
        status: { $in: ["scheduled", "in-progress"] },
      };

      if (providerId) {
        query.providerId = providerId;
      }

      const appointments = await AppointmentsCollection.find(query, {
        sort: { date: 1 },
      }).fetch();

      // 3. Sliding window to find the earliest gap between appointments that can fit the service duration
      let windowStart = new Date(dayStart);
      let windowEnd = new Date(dayStart.getTime() + service.duration * 60000);
      let slotFound = true; // assume a slot exists until proven otherwise

      // Uses appointment's duration rather than service' duration because if a service's duration changes, it shouldn't affect already scheduled appointments
      // TODO: do tests for this edge case
      for (const appointment of appointments) {
        // Window has slid past end of day — no slot today
        if (windowEnd > dayEnd) {
          slotFound = false;
          break;
        }

        if (
          hasOverlap(
            { date: windowStart, endDate: windowEnd },
            { date: appointment.date, endDate: appointment.endDate },
          )
        ) {
          // Slide window to after this appointment
          windowStart = new Date(appointment.endDate);
          windowEnd = new Date(
            windowStart.getTime() + service.duration * 60000,
          );
        } else {
          // Gap found — slot is available
          return windowStart;
        }
      }

      // Check the slot after all appointments (or if there were none)
      if (slotFound && windowEnd <= dayEnd) return windowStart;

      // No slot today — advance to next day
      currentDay.setDate(currentDay.getDate() + 1);
      currentDay.setHours(...convertStrToHrs(WORKING_HOURS.startTime));
    }

    // No slot found in entire search range
    return undefined;
  },
});

// Exports for the Meteor methods
export async function insertAppointment(data: AppointmentData) {
  return Meteor.callAsync("appointments.insert", data);
}

export async function removeAppointment(id: string) {
  return Meteor.callAsync("appointments.remove", id);
}

export async function markAsCompleted(id: string) {
  return Meteor.callAsync("appointments.complete", id);
}

export async function markAsStarted(id: string) {
  return Meteor.callAsync("appointments.start", id);
}

export async function markAsCancelled(id: string) {
  return Meteor.callAsync("appointments.cancel", id);
}

export async function markAsScheduled(id: string) {
  return Meteor.callAsync("appointments.scheduled", id);
}

export async function getEarliestAppointment(
  serviceId: string,
  providerId?: string,
): Promise<Date | undefined> {
  return Meteor.callAsync("appointments.getEarliest", serviceId, providerId);
}
