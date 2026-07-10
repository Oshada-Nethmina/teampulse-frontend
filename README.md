# TeamPulse Frontend

A modern **Next.js** application for the **Weekly Report Generator & Team Dashboard**. It enables team members to submit weekly reports and managers to monitor team performance through an interactive dashboard.

## Features

* JWT Authentication
* Role-Based Access Control
* Weekly Report Management
* Manager Dashboard
* Project Management
* Charts & Analytics
* AI Chat Assistant UI (API key required)
* Responsive Design
* Built with reusable React components

## Tech Stack

* Next.js
* React
* TypeScript
* Tailwind CSS
* Axios
* React Hook Form
* Recharts
* React Hot Toast

## Prerequisites

* Node.js 18+
* npm or yarn
* Backend API running

## Installation

Clone the repository:

```bash
git clone <frontend-repository-url>
cd teampulse-frontend
```

Install dependencies:

```bash
npm install
```

## Environment Variables

Create a `.env.local` file.

```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

## Running the Application

Development mode:

```bash
npm run dev
```

Production build:

```bash
npm run build
npm start
```

The application will be available at:

```
http://localhost:3000
```

## Project Structure

```
src/
 ├── app/
 ├── components/
 ├── hooks/
 ├── lib/
 ├── services/
 ├── types/
 └── utils/
```

## AI Assistant

The frontend includes an AI Chat interface.

To enable AI responses:

* Configure the backend with a valid OpenAI API key.
* Ensure the backend AI endpoint is available.

Without an API key, the chat interface will be visible, but AI responses will not be generated.

## Available Scripts

```bash
npm run dev
npm run build
npm run lint
```

## Backend Repository

Run the backend before starting the frontend.


