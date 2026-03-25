# Smart Queue UI

React frontend for the **UCU Smart Queuing System** — a real-time appointment and queue management platform.

## Tech Stack

- **Framework**: React 19 + Vite 6
- **UI Library**: Material-UI (MUI) v7
- **Routing**: React Router v7
- **Charts**: ApexCharts (react-apexcharts)
- **Real-time**: socket.io-client

## Features

- **Dashboard** — KPI cards, status donut chart, daily volume bar chart, recent appointments
- **Book Slot** — Students browse available time slots and book appointments
- **My Queue** — Students track their queue position and status in real-time
- **Admin Slots** — Admins create and manage time slots per counter
- **Admin Queue** — Admins manage the live queue (serve, skip, mark no-show)
- **Users** — User management (admin)
- **Reports** — Analytics: service rates, no-show rates, appointment reasons, trends
- **Auth** — Login and registration with JWT

## Getting Started

```bash
npm install
npm run dev
```

The app runs at `http://localhost:5173` and expects the API at `http://localhost:3000`.
