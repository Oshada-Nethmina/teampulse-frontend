# Weekly Report Generator & Team Dashboard

This project is the frontend implementation for the Weekly Report Generator & Team Dashboard assignment.

## Features

- **Authentication & Roles**: Users can login as a `TEAM_MEMBER` or `MANAGER`. The mock state is maintained via a React Context and `localStorage`.
- **Personal Weekly Reports**: Team members can create and submit standard weekly reports. Past reports are listed below the form.
- **Manager Dashboard**: Managers get an exclusive view with key metrics (submission counts, open blockers) and visual charts (Tasks Completed Trend, Workload Distribution) powered by `recharts`.
- **Projects Management**: Skeleton interface accessible by Managers to track different work categories.

## Setup Instructions

### 1. Installing dependencies

Navigate to the project root and run:

```bash
npm install
```

### 2. Running frontend

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### 3. Running backend

(Not implemented as per "I want to create only front end" request). The frontend uses an in-memory mocked state.

### 4. Running database

(Not implemented as per "I want to create only front end" request).

## Technologies Used

- **Framework**: Next.js (App Router)
- **Styling**: Vanilla CSS Modules (no Tailwind)
- **Icons**: Lucide React
- **Charts**: Recharts
