# IntelliCircle: Professional Networking Platform

IntelliCircle is a location-based professional networking platform that connects users through AI-powered chat rooms organized by shared interests. It fosters local connections that can grow into global networks, featuring real-time chat, location discovery, and user profiling.

![IntelliCircle Logo](generated-icon.png)

## 📋 Table of Contents
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Database Schema](#-database-schema)
- [API Routes](#-api-routes)
- [Deployment](#-deployment)

## 🚀 Features

* **Location-Based Discovery**: Automatically detects user location to find relevant professional chat rooms nearby.
* **Real-Time Chat**: Instant messaging in rooms powered by WebSockets with live participant tracking.
* **Interest Matching**: Smart room recommendations based on professional interests (e.g., Technology, Business, Healthcare).
* **User Profiles**: customizable profiles with profession, bio, and privacy settings for location sharing.
* **Waitlist System**: Integrated landing page form for capturing early user interest.
* **Responsive Design**: Mobile-first UI built with Shadcn/UI and Tailwind CSS.

## 🛠 Tech Stack

**Frontend:**
* **Framework**: React 18 with TypeScript
* **Build Tool**: Vite
* **Styling**: Tailwind CSS, PostCSS, and Shadcn UI (Radix UI primitives)
* **Routing**: Wouter for lightweight client-side routing
* **State Management**: TanStack Query (React Query)
* **Animations**: Framer Motion

**Backend:**
* **Runtime**: Node.js
* **Framework**: Express.js
* **Real-Time**: Native WebSocket (`ws`) implementation
* **Database**: MySQL (via Drizzle ORM)
* **Validation**: Zod for runtime schema validation

## 📂 Project Structure

```text
├── client/                 # Frontend Application
│   ├── src/
│   │   ├── components/     # UI Components (Button, Card, Inputs, etc.)
│   │   ├── hooks/          # Custom hooks (use-toast, use-mobile)
│   │   ├── lib/            # Utilities (queryClient, utils)
│   │   ├── pages/          # Page views (Home, Chat, Discover, Profile)
│   │   ├── App.tsx         # Main router and provider setup
│   │   └── main.tsx        # Entry point
├── server/                 # Backend Application
│   ├── index.ts            # Server entry, middleware, and logging
│   ├── routes.ts           # API endpoints and WebSocket logic
│   ├── storage.ts          # Database interface and memory storage
│   ├── db.ts               # Database connection setup
│   └── vite.ts             # Vite middleware for development
├── shared/                 # Shared Resources
│   └── schema.ts           # Database schema and shared TypeScript types
├── drizzle.config.ts       # Drizzle ORM configuration
├── tailwind.config.ts      # Tailwind CSS configuration
└── vite.config.ts          # Vite build configuration
