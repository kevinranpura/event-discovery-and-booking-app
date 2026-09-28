# EventApp - Event Discovery & Booking Mobile App

A full-stack event discovery and ticket booking mobile application built with **React Native (Expo)**, **TypeScript**, **Zustand**, **Node.js/Express**, and **PostgreSQL**.

---

## Features

### Attendee Features
- **Authentication**: Registration with full validation (name, email, mobile, password, confirm password) and Login with JWT session persistence. One-tap demo account shortcuts on login.
- **Home Screen**: Header greeting with avatar, unread notifications badge, horizontal category browser with vector icons, featured events carousel, and upcoming events list.
- **Explore & Search**: Live search by event title, organizer, venue, or artist; horizontal category selector; bottom-sheet filter modal (date, category, min/max price range, seat availability toggle); active filter tags; and custom vector-icon empty states.
- **Event Details**: Hero cover banner, category badge, date, time, venue, full address, description, organizer card, live seat availability counter, heart favorite toggle, and sticky "Book Now" CTA.
- **Ticket Booking Flow**: Ticket tier selection (General, VIP, Early Bird), dynamic quantity stepper with real-time capacity validation, dynamic price breakdown (subtotal, service charges, total).
- **Booking Confirmation & Digital Ticket**: Instant confirmation modal, booking ID (`EVT-XXXXX`), scannable digital ticket pass with dynamic high-resolution QR code, targeting brackets, event/date/venue/quantity metadata, and status badge.
- **My Bookings**: Segmented tabs (**Upcoming**, **Completed**, **Cancelled**), ticket card summary, full digital pass view, and booking cancellation with confirmation dialog that automatically restores available seats.
- **Favorites**: Add/remove saved events with instant state sync and a dedicated Favorites screen with direct booking shortcuts.
- **In-App Notifications**: Booking confirmations, cancellations, event reminders, and updates with unread count badges and "Mark all read" action.
- **Profile Screen**: Member avatar with initials, user name, email, mobile, role badge (*Event Attendee* / *Event Organizer*), Edit Profile modal, app settings, and sign out with confirmation.

### Organizer Features
- **Organizer Dashboard**: Stat summary cards for **Total Events**, **Upcoming Events**, **Total Bookings**, and **Total Revenue**.
- **Event Management**: Create, edit, and delete events with confirmation dialogs.
- **Create / Edit Event Form**: Validated inputs for name, description, category, image URL, date, start/end time, venue, address, ticket price, and total seats.
- **Attendees Roster**: Per-event attendee list with live attendee search by name/email, ticket quantity breakdown, booking ID, booking date, and total revenue tracking.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React Native, Expo (SDK 52), TypeScript |
| **Navigation** | Expo Router (file-based routing) |
| **Styling** | NativeWind / Tailwind CSS + Polished Off-White Theme (`#F8FAFC`, `#FFFFFF`, `#0F172A`, `#4F46E5`) |
| **Icons** | `@expo/vector-icons` (Ionicons) — Zero emojis |
| **State Management** | Zustand (persistent auth, events, bookings, favorites, notifications) |
| **HTTP Client** | Axios with automated response data unwrapping interceptor |
| **Backend** | Node.js, Express.js (REST API) |
| **Database** | PostgreSQL (Dockerized or local instance) |
| **Authentication** | JWT (`jsonwebtoken` + `bcryptjs`) |
| **Validation** | `express-validator` (backend) + Inline form validation (frontend) |

---

## Project Structure

```
Event Discovery & Booking App/
├── backend/
│   ├── database/
│   │   ├── migrations/
│   │   │   └── 001_initial_schema.sql     # Pure SQL initial schema & indexes
│   │   └── seed.sql                       # Pure SQL seed records
│   ├── src/
│   │   ├── database/
│   │   │   ├── db.js                      # PostgreSQL pool setup
│   │   │   ├── migrate.js                 # Database migration runner
│   │   │   └── seed.js                    # Database seed runner
│   │   ├── middleware/
│   │   │   └── auth.js                    # JWT verification & role middleware
│   │   ├── routes/
│   │   │   ├── auth.js                    # Register, login, get profile
│   │   │   ├── events.js                  # Event CRUD & search/filter
│   │   │   ├── bookings.js                # Booking creation, list, cancellation
│   │   │   ├── favorites.js               # Saved events management
│   │   │   ├── notifications.js          # In-app notifications
│   │   │   └── organizer.js              # Organizer dashboard & attendees
│   │   └── server.js                      # Express server entrypoint
│   ├── .env                               # Local backend environment
│   ├── .env.example
│   ├── package.json
│   └── package-lock.json
│
├── frontend/
│   ├── app/                               # Expo Router screens
│   │   ├── (auth)/                        # Login & registration screens
│   │   ├── (tabs)/                        # Home, Explore, Favorites, Bookings, Profile
│   │   ├── event/                         # [id].tsx (details) & booking.tsx (checkout)
│   │   ├── booking/                       # [id].tsx (digital ticket pass)
│   │   ├── organizer/                     # dashboard.tsx, create-event.tsx, attendees.tsx
│   │   ├── notifications.tsx              # Notifications center
│   │   └── _layout.tsx                    # Root navigation & alert polyfill
│   ├── components/                        # Reusable UI components
│   │   ├── EventCard.tsx
│   │   ├── BookingCard.tsx
│   │   ├── NotificationCard.tsx
│   │   ├── SearchBar.tsx
│   │   ├── FilterModal.tsx
│   │   ├── InputField.tsx
│   │   ├── PrimaryButton.tsx
│   │   └── LoadingIndicator.tsx
│   ├── constants/                         # Colors, theme tokens, categories
│   ├── services/                          # Axios API clients
│   ├── store/                             # Zustand state stores
│   ├── types/                             # TypeScript interfaces & types
│   ├── utils/                             # Helpers & cross-platform dialog polyfill
│   ├── .env                               # Frontend environment variables
│   ├── .env.example
│   ├── app.json
│   ├── babel.config.js
│   ├── package.json
│   ├── package-lock.json
│   ├── tailwind.config.js
│   └── tsconfig.json
│
├── .gitignore                             # Single root gitignore
├── docker-compose.yml                     # PostgreSQL container configuration
└── README.md
```

---

## Quickstart & Installation

### 1. Database Setup (Docker or Local)

**Using Docker (Recommended):**
```bash
docker compose up -d
```

**Using Local PostgreSQL:**
```bash
psql -U postgres -c "CREATE DATABASE eventapp;"
```

---

### 2. Backend Setup

```bash
cd backend

# Configure environment
cp .env.example .env

# Install dependencies
npm install

# Run database migrations and seed data
npm run db:migrate
npm run db:seed

# Start the backend server
npm start
```
The backend server runs on `http://localhost:3000`.

---

### 3. Frontend Setup

```bash
cd frontend

# Configure environment
cp .env.example .env

# Install dependencies
npm install --legacy-peer-deps

# Run on Web (Browser)
npm run web

# Or run via Expo Go (Mobile)
npm start
```
The web app opens on `http://localhost:8081`.

---

## Test Accounts (Demo Credentials)

You can use the one-tap demo pill buttons on the Login screen, or enter:

| Role | Email | Password |
|---|---|---|
| **Attendee** | `user@example.com` | `password123` |
| **Organizer** | `organizer@example.com` | `password123` |

---

## Environment Variables

### Backend (`backend/.env`)
```ini
PORT=3000
DATABASE_URL=postgresql://postgres:password@localhost:5432/eventapp
JWT_SECRET=supersecretjwtkey_eventapp_2026_secure
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

### Frontend (`frontend/.env`)
```ini
# For Web & iOS Simulator
EXPO_PUBLIC_API_URL=http://localhost:3000

# For Android Emulator: http://10.0.2.2:3000
# For Physical Device:  http://<YOUR_LOCAL_IP>:3000
```

---

## API Endpoints

### Authentication
- `POST /api/auth/register` — Register a new attendee or organizer
- `POST /api/auth/login` — Login with email and password
- `GET  /api/auth/me` — Get authenticated user profile
- `PUT  /api/auth/profile` — Update user name or mobile

### Events
- `GET    /api/events` — List events with filters (search, category, date, price, location)
- `GET    /api/events/:id` — Get single event details
- `POST   /api/events` — Create event (Organizer only)
- `PUT    /api/events/:id` — Update event (Organizer only)
- `DELETE /api/events/:id` — Delete event (Organizer only)

### Bookings
- `POST /api/bookings` — Book tickets (with seat capacity validation)
- `GET  /api/bookings` — List authenticated user's bookings
- `GET  /api/bookings/:id` — Get single booking / ticket details
- `PUT  /api/bookings/:id/cancel` — Cancel booking and restore available seats

### Favorites
- `GET    /api/favorites` — List user's saved events
- `POST   /api/favorites` — Add event to favorites
- `DELETE /api/favorites/:eventId` — Remove event from favorites

### Notifications
- `GET /api/notifications` — List user notifications
- `PUT /api/notifications/:id/read` — Mark notification as read
- `PUT /api/notifications/read-all` — Mark all notifications as read

### Organizer
- `GET /api/organizer/dashboard` — Get stats (total events, upcoming, bookings, revenue)
- `GET /api/organizer/events` — List organizer's own events
- `GET /api/organizer/events/:id/attendees` — List registered attendees for an event

---

## Database Schema

```sql
users(id, name, email, mobile, password, role, created_at)
events(id, organizer_id, name, description, category, image, date,
       start_time, end_time, venue, address, ticket_price, total_seats,
       available_seats, created_at)
bookings(id, user_id, event_id, ticket_type, quantity, total_amount,
         status, created_at)
favorites(id, user_id, event_id, created_at)
notifications(id, user_id, title, message, is_read, created_at)
```

---

## User Flow

```
Registration / Login
  └── Home Screen
        ├── Explore Events (Search & Filter)
        │     └── Event Details
        │           └── Ticket Booking (Type & Quantity)
        │                 └── Booking Confirmation
        │                       └── Digital Ticket Pass (QR Code)
        ├── Favorites Screen (Saved Events)
        ├── My Bookings (Upcoming / Completed / Cancelled)
        │     ├── View Digital Ticket Pass
        │     └── Cancel Booking (Restores Seat Availability)
        ├── Notifications Screen
        └── Profile Screen
              └── Organizer Dashboard (If Organizer Role)
                    ├── Create / Edit / Delete Event
                    └── Event Attendees Roster
```
