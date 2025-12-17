# IntelliCircle

**IntelliCircle** is a location-based professional networking platform designed to connect individuals through AI-powered chat rooms organized by shared interests and geographic proximity. It facilitates meaningful professional connections by allowing users to discover local colleagues, join interest-specific conversations, and network in real-time.

## 🚀 Features

  * **Location-Based Discovery**: Automatically detects user location to suggest relevant professional chat rooms nearby.
  * **Real-Time Chat**: Instant messaging powered by WebSockets, supporting concurrent users and live updates.
  * **Interest Matching**: categorization of rooms based on professional fields (Technology, Business, Healthcare, etc.).
  * **Dynamic Room Creation**: Users can create new rooms with specific topics and interest tags.
  * **User Profiles**: Customizable profiles with professional details, bios, and interest management.
  * **Waitlist System**: Integrated waitlist functionality for onboarding new users during beta.
  * **Responsive Design**: Fully mobile-responsive UI built with Tailwind CSS and Shadcn UI.

## TB Architecture & Tech Stack

IntelliCircle utilizes a modern full-stack architecture with a monorepo-style structure sharing types between the frontend and backend.

### Frontend

  * **Framework**: [React](https://react.dev/) (v18) with [TypeScript](https://www.typescriptlang.org/)
  * **Build Tool**: [Vite](https://vitejs.dev/)
  * **Styling**: [Tailwind CSS](https://tailwindcss.com/)
  * **UI Components**: [Shcn/ui](https://ui.shadcn.com/) (Radix UI primitives)
  * **State Management**: [TanStack Query](https://tanstack.com/query/latest)
  * **Routing**: [Wouter](https://github.com/molefrog/wouter)
  * **Animations**: [Framer Motion](https://www.framer.com/motion/)

### Backend

  * **Server**: [Node.js](https://nodejs.org/) & [Express](https://expressjs.com/)
  * **Real-Time**: Native `ws` (WebSocket) implementation
  * **ORM**: [Drizzle ORM](https://orm.drizzle.team/)
  * **Validation**: [Zod](https://zod.dev/) (Shared schemas between client/server)

### Database

  * **System**: MySQL (via `mysql2` driver)
  * **Hosting**: Provisioned for InfinityFree/Cloud based on configuration.

## xC Folder Structure

```text
├── client/                 # Frontend React Application
│   ├── src/
│   │   ├── components/     # Reusable UI components (shadcn/ui)
│   │   ├── hooks/          # Custom React hooks (use-toast, use-mobile)
│   │   ├── lib/            # Utilities (queryClient, tailwind merge)
│   │   ├── pages/          # Application routes (Home, Chat, Discover, Profile)
│   │   ├── App.tsx         # Main component & Routing logic
│   │   └── main.tsx        # Entry point
│   └── index.html
├── server/                 # Backend Node/Express Application
│   ├── db.ts               # Database connection configuration
│   ├── index.ts            # Entry point and server setup
│   ├── routes.ts           # API routes & WebSocket logic
│   ├── storage.ts          # Storage interface (Memory/DB abstraction)
│   └── vite.ts             # Vite middleware for dev mode
├── shared/                 # Code shared between frontend and backend
│   └── schema.ts           # Drizzle ORM schemas & Zod types
├── drizzle.config.ts       # Drizzle Kit configuration
├── package.json            # Project dependencies and scripts
└── render.yaml             # Render deployment configuration
```

## 🛠️ Getting Started

### Prerequisites

  * Node.js (v20 or higher recommended)
  * A MySQL Database connection string

### Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/yourusername/intellicircle.git
    cd intellicircle
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Environment Configuration:**
    Create a `.env` file in the root directory (or use the existing one). You must provide a valid database URL.

    ```env
    DATABASE_URL="mysql://user:password@host:port/database_name"
    ```

4.  **Database Migration:**
    Push the schema to your database using Drizzle Kit.

    ```bash
    npm run db:push
    ```

### Running the Application

  * **Development Mode:**
    Runs the Express server with Vite middleware for hot-reloading the frontend.

    ```bash
    npm run dev
    ```

    The app will be available at `http://localhost:5000`.

  * **Production Build:**
    Builds the client and server for production.

    ```bash
    npm run build
    npm run start
    ```

## 🔌 API & WebSockets

### REST API

  * `POST /api/waitlist`: Adds a user to the waitlist.
      * Payload: `{ fullName, email, profession, location, interests }`

### WebSocket Events

The chat system uses a JSON-based message protocol over WebSockets (`/ws`).

  * **Client -\> Server:**

      * `joinRoom`: `{ type: 'joinRoom', roomId, username }`
      * `sendMessage`: `{ type: 'sendMessage', roomId, content }`
      * `createRoom`: `{ type: 'createRoom', name, interests }`
      * `getRooms`: `{ type: 'getRooms' }`
      * `ping`: `{ type: 'ping' }` (Keep-alive)

  * **Server -\> Client:**

      * `rooms`: Returns list of available rooms.
      * `message`: Broadcasts a new message to a room.
      * `roomJoined`: Returns full room history/details upon joining.
      * `participantsUpdate`: Updates the list of active users in a room.

## 💾 Database Schema

The database schema is defined in `shared/schema.ts` and includes:

  * **waitlist**: Stores prospective users (email, interests, etc.).
  * **users**: Stores chat users.
  * **chatRooms**: Active chat rooms and their metadata.
  * **messages**: History of messages per room.
  * **participants**: Junction table for users in rooms.

## ☁️ Deployment

The project is configured for deployment on various platforms:

  * **Render**: Use `render.yaml` for a blueprint deployment of the web service and database.
  * **Netlify**: `netlify.toml` handles the client-side build settings (`npm run build:client`).
  * **Replit**: `.replit` and `replit.md` are configured for instant cloud development.

## 🤝 Contributing

Contributions are welcome\! Please follow these steps:

1.  Fork the project.
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.

## 📄 License

Distributed under the MIT License. See `[LICENSE](https://github.com/Dharm3112/IntelliCircle/blob/main/LICENSE) for more information.

*Created by [Dharm Patel](https://github.com/Dharm3112) & [Pushti Kadia](https://github.com/pushtikadia)*
