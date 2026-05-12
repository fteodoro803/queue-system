# Queue System

A web-based scheduling platform designed to improve patient and administrator experiences in environments where
technical infrastructure may be limited.

## Demo

- Video walkthrough (March 12, 2026): [YouTube Demo](https://www.youtube.com/watch?v=grjqZ2xFrk8)
- To try the latest interactive version of the demo, email: `fteodoro803@gmail.com`

## Why This Project Exists

Many clinics and service centers still run scheduling and queueing with fragmented tools (paper lists, spreadsheets, or
ad-hoc apps). That leads to missed updates, avoidable wait time, and friction between front-desk workflows and patient
expectations.

This project aims to provide a practical, modern baseline for:

- Faster check-in and queue visibility
- Cleaner day-to-day operations for staff
- Real-time updates across the app without manual refreshes
- A mobile-friendly experience that still works in constrained environments

## Product Philosophy

- **Reactive Data Sync:** Utilizing Meteor to enable instant client-server synchronization.
- **Mobile-First Design:** Optimized for low-bandwidth environments to ensure accessibility for all users.
- **Real-Time Availability:** Dynamic scheduling updates to prevent double-booking and reduce wait times.
- **Human-Centered Simplicity:** Clear, role-oriented screens for admins and patients.

## Core Capabilities

- Queue workflow management
- Provider, service, and patient record management
- Role-based navigation (admin and patient flows)
- Dashboard views and operational stats
- Configurable app settings and theme controls

## Tech Stack

### Frontend

- React 18 + TypeScript
- React Router 6
- Tailwind CSS 4 + DaisyUI
- Recharts (data visualization)

### Backend / Runtime

- Meteor (publications, methods, and reactive data layer)
- MongoDB (via Meteor collections)

### Quality / Tooling

- ESLint + TypeScript ESLint
- Prettier
- Mocha + Chai (Meteor test driver)

## Project Structure (High-Level)

```text
client/                 # Client entry and styles
imports/api/            # Collections and Meteor methods
imports/ui/             # React UI: pages, components, navigation
imports/contexts/       # Shared client context providers
imports/utils/          # Utility modules
server/                 # Server startup and demo seed wiring
tests/                  # Unit + integration tests
```

## Screenshots

Current demo preview:

![Demo Screenshot](https://github.com/user-attachments/assets/ecd54521-7b08-4e65-acb1-903e878e5777)

Suggested additions (drop files in `docs/screenshots/` and update links):

- `docs/screenshots/dashboard.png`
- `docs/screenshots/queue-mobile.png`
- `docs/screenshots/settings-mobile.png`
- `docs/screenshots/provider-availability.png`

## Deployment Notes

- This app supports seeded demo data for quick setup.
- For shared demos, consider timed reseeding to keep data clean while preserving real-time behavior.
- For isolated demos, consider per-session data partitioning if required.

