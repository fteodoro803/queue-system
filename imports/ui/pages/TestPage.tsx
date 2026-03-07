import React, { useState } from "react";
import { GenericField } from "../components/GenericField";
import { EmailField } from "../components/EmailField";
import { NumberField } from "../components/NumberField";
import { Calendar } from "../components/Calendar";
import { Steps } from "../components/Steps";
import { DateIcon } from "../components/DateIcon";
import { Avatar } from "../components/Avatar";
import { Patient } from "/imports/api/patient";
import { Appointment } from "/imports/api/appointment";
import { Provider, ProviderService } from "/imports/api/provider";
import { Service } from "/imports/api/service";
import { DashboardCard } from "../components/DashboardCard";
import { HomeIcon } from "@heroicons/react/24/outline";
import { useDateTime } from "../../contexts/DateTimeContext";
import { QueueIcon } from "../components/QueueIcon";
import { QueueEntry } from "/imports/api/queueEntry";
import { QueueListItem } from "../queue/QueueListItem";
import { getEndOfDay, getStartOfDay } from "/imports/utils/utils";
import { AppointmentList } from "../appointment/AppointmentList";
import { QueueListItemPatient } from "../queue/QueueListItemPatient";

export const TestPage = () => {
  const now = useDateTime(); // context date and time

  const [genericFieldValue, setGenericFieldValue] = useState<string>("");
  const [emailFieldValue, setEmailFieldValue] = useState<string>("");
  const [numberFieldValue, setNumberFieldValue] = useState<string>("");

  const [date, setDate] = useState<Date | undefined>(now);

  const step = 3;
  const steps: Record<number, string> = {
    1: "Step1",
    2: "Step2",
    3: "Step3",
    4: "Step4",
    5: "Step5",
  };

  const service1: Service = {
    _id: "service1",
    shortcode: "CON",
    name: "General Consultation",
    description: "A general health consultation with a provider.",
    duration: 30,
    cost: 500,
    createdAt: date ?? new Date(),
  };

  const service2: Service = {
    _id: "service2",
    shortcode: "DEN",
    name: "Dental Cleaning",
    description: "Professional dental cleaning service.",
    duration: 45,
    cost: 300,
    createdAt: date ?? new Date(),
  };

  const providerServices: ProviderService[] = [
    {
      id: service1._id,
      name: service1.name,
      enabled: true,
    },
    {
      id: service2._id,
      name: service2.name,
      enabled: true,
    },
  ];

  const patient: Patient = {
    _id: "12345",
    name: "John Doe",
    createdAt: date ?? new Date(),
  };

  const provider: Provider = {
    _id: "54321",
    name: "Dr. Smith",
    services: providerServices,
    createdAt: date ?? new Date(),
  };

  const appointment: Appointment = {
    _id: "67890",
    patientId: patient._id,
    patient: patient,
    providerId: provider._id,
    provider: provider,
    serviceId: service1._id,
    service: service1,
    scheduled_start: date ?? new Date(),
    scheduled_end: new Date(
      (date ?? new Date()).getTime() + service1.duration * 60000,
    ),
    status: "scheduled",
    createdAt: date ?? new Date(),
  };

  const queueEntry1: QueueEntry = {
    _id: "queueEntry1",
    displayId: "QU-01",
    patientId: patient._id,
    patient: patient,
    serviceId: service1._id,
    service: service1,
    position: 1,
    status: "waiting",
    start: null,
    end: null,
    createdAt: date ?? new Date(),
  };

  const queueEntry2: QueueEntry = {
    _id: "queueEntry2",
    displayId: "QU-02",
    patientId: patient._id,
    patient: patient,
    serviceId: service1._id,
    service: service1,
    position: 0,
    status: "in-progress",
    start: getStartOfDay(date ?? new Date()),
    end: null,
    createdAt: date ?? new Date(),
  };

  const queueEntry3: QueueEntry = {
    _id: "queueEntry3",
    displayId: "QU-03",
    patientId: patient._id,
    patient: patient,
    serviceId: service1._id,
    service: service1,
    position: 1,
    status: "completed",
    start: getStartOfDay(now),
    end: getEndOfDay(now),
    createdAt: date ?? new Date(),
  };

  const queueEntry4: QueueEntry = {
    _id: "queueEntry4",
    displayId: "QU-04",
    patientId: patient._id,
    patient: patient,
    serviceId: service1._id,
    service: service1,
    position: 1,
    status: "cancelled",
    start: null,
    end: null,
    createdAt: date ?? new Date(),
  };

  return (
    <>
      <h1 className="text-3xl font-bold">Test Page</h1>

      {/* Theme */}
      <div className="mt-4">
        <p className="text-xl font-semibold">Theme</p>
        <div className="flex gap-2">
          <button className="btn btn-primary">Primary</button>
          <button className="btn btn-secondary">Secondary</button>
          <button className="btn btn-accent">Accent</button>
          <button className="btn">Standard</button>
        </div>
      </div>

      {/* Field */}
      <div className="mt-4">
        <p className="text-xl font-semibold">Fields</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <p className="text-sm">Generic Field: mode=write</p>
            <GenericField
              value={genericFieldValue}
              onChange={setGenericFieldValue}
              mode="write"
              placeholder="placeholder"
            />
          </div>

          <div>
            <p className="text-sm">Generic Field: mode=read</p>
            <GenericField
              value={genericFieldValue}
              onChange={setGenericFieldValue}
              mode="read"
              placeholder="placeholder"
            />
          </div>
          <div>
            <p className="text-sm">Generic Field: mode=editable</p>
            <GenericField
              value={genericFieldValue}
              onChange={setGenericFieldValue}
              mode="editable"
              placeholder="placeholder"
            />
          </div>
          <div>
            <p className="text-sm">Generic Field: ghost</p>
            <GenericField
              value={genericFieldValue}
              onChange={setGenericFieldValue}
              mode="write"
              additionalAttributes="input-ghost"
              placeholder="placeholder"
            />
          </div>
          <div>
            <p className="text-sm">Email Field</p>
            <EmailField
              value={emailFieldValue}
              onChange={setEmailFieldValue}
              mode="write"
              placeholder="placeholder@email.com"
            />
          </div>
          <div>
            <p className="text-sm">Number Field</p>
            <NumberField
              value={numberFieldValue}
              onChange={setNumberFieldValue}
              mode="write"
              placeholder="12345"
            />
          </div>
        </div>
      </div>

      {/* Badges */}
      <div className="mt-4 flex flex-col gap-2">
        <p className="text-xl font-semibold">Badges</p>
        <div className="flex gap-2">
          <div className="badge badge-info">Info</div>
          <div className="badge badge-warning">Warning</div>
          <div className="badge badge-success">Success</div>
          <div className="badge badge-error">Error</div>
        </div>
        <div className="flex gap-2">
          <div className="badge badge-soft badge-info">Info</div>
          <div className="badge badge-soft badge-warning">Warning</div>
          <div className="badge badge-soft badge-success">Success</div>
          <div className="badge badge-soft badge-error">Error</div>
        </div>
      </div>

      {/* Calendar */}
      <div className="mt-4">
        <p className="text-xl font-semibold">Calendar</p>
        <Calendar date={date} setDate={setDate} />
      </div>

      {/* Date Icon */}
      <div className="mt-4">
        <p className="text-xl font-semibold">Date Icon</p>
        <DateIcon date={date ?? new Date()} />
      </div>

      {/* Steps */}
      <div className="mt-4">
        <p className="text-xl font-semibold">Steps</p>
        <Steps currentStep={step} steps={steps} />
      </div>

      {/* Avatar */}
      <div className="mt-4">
        <p className="text-xl font-semibold">Avatar</p>
        <Avatar profile={patient} />
      </div>

      {/* Appointment List Item */}
      <div className="mt-4">
        <p className="text-xl font-semibold">Appointment List Item</p>
        <AppointmentList appointments={[appointment]} />
      </div>

      {/* Dashboard Card */}
      <div className="mt-4">
        <p className="text-xl font-semibold">Dashboard Card</p>
        <DashboardCard
          header="Header"
          body="Body"
          footer="Footer"
          icon={HomeIcon}
        />
      </div>

      {/* Queue Icon */}
      <div className="mt-4">
        <p className="text-xl font-semibold">Queue Icon</p>
        <QueueIcon entry={queueEntry1} />
      </div>

      {/* Queue List Item (Admin) */}
      <div className="mt-4">
        <p className="text-xl font-semibold">Queue List Item (Admin)</p>
        <ul className="list bg-base-100 rounded-box shadow-md">
          <QueueListItem entry={queueEntry1} />
          <QueueListItem entry={queueEntry2} />
          <QueueListItem entry={queueEntry3} />
          <QueueListItem entry={queueEntry4} />
        </ul>
      </div>

      {/* Queue List Item (Patient) */}
      <div className="mt-4">
        <p className="text-xl font-semibold">Queue List Item (Patient)</p>
        <ul className="list bg-base-100 rounded-box shadow-md">
          <QueueListItemPatient entry={queueEntry1} />
          <QueueListItemPatient entry={queueEntry2} />
        </ul>
      </div>
    </>
  );
};
