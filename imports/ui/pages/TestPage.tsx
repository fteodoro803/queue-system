import React, { useState } from "react";
import { GenericField } from "../components/GenericField";
import { EmailField } from "../components/EmailField";
import { NumberField } from "../components/NumberField";
import { Calendar } from "../components/Calendar";
import { Steps } from "../components/Steps";
import { DateIcon } from "../components/DateIcon";
import { Avatar } from "../components/Avatar";
import { Patient } from "/imports/api/patient";
import { AppointmentCard } from "../appointment/AppointmentCard";
import { Appointment } from "/imports/api/appointment";
import { Provider, ProviderService } from "/imports/api/provider";
import { Service } from "/imports/api/service";
import { DashboardCard } from "../components/DashboardCard";
import { HomeIcon } from "@heroicons/react/24/outline";

export const TestPage = () => {
  const [genericFieldValue, setGenericFieldValue] = useState<string>("");
  const [emailFieldValue, setEmailFieldValue] = useState<string>("");
  const [numberFieldValue, setNumberFieldValue] = useState<string>("");

  const [date, setDate] = useState<Date | undefined>(undefined);
  const step = 2;

  const service1: Service = {
    _id: "service1",
    name: "General Consultation",
    description: "A general health consultation with a provider.",
    duration: 30,
    cost: 500,
    createdAt: date ?? new Date(),
  };

  const service2: Service = {
    _id: "service2",
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
    patient: patient,
    provider: provider,
    service: service1,
    date: date ?? new Date(),
    status: "scheduled",
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
        <Steps step={step} />
      </div>

      {/* Avatar */}
      <div className="mt-4">
        <p className="text-xl font-semibold">Avatar</p>
        <Avatar profile={patient} />
      </div>

      {/* Appointment Card */}
      <div className="mt-4">
        <p className="text-xl font-semibold">Appointment Card</p>
        <AppointmentCard appointment={appointment} />
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
    </>
  );
};
