<p align="center">
  <img src="frontend/public/seatlock-logo.png" alt="SeatLock Logo" width="120" />
</p>

<h1 align="center">🎟️ SeatLock</h1>

<p align="center">
  <strong>A production-grade distributed seat reservation system designed to handle extreme concurrency</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express" />
  <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white" alt="Redis" />
  <img src="https://img.shields.io/badge/Stripe-008CDD?style=for-the-badge&logo=stripe&logoColor=white" alt="Stripe" />
  <img src="https://img.shields.io/badge/Socket.IO-010101?style=for-the-badge&logo=socket.io&logoColor=white" alt="Socket.IO" />
</p>

---

## 🎯 The Problem

**Seat reservation systems face a fundamental distributed systems challenge**: when thousands of users simultaneously try to book the same seats (think concert ticket drops or flight bookings), how do you prevent double-bookings while maintaining a responsive user experience?

Traditional approaches using simple database locks either:
- **Create race conditions** — resulting in overselling
- **Block too aggressively** — destroying user experience with timeouts
- **Lack visibility** — users don't know if a seat is being held by someone else

---

## 💡 The Solution

**SeatLock** implements a **dual-layer locking architecture** that combines the speed of Redis with the durability of PostgreSQL:

```
┌──────────────────────────────────────────────────────────────────────────┐
│                           USER REQUEST                                   │
└─────────────────────────────────┬────────────────────────────────────────┘
                                  │
                                  ▼
┌──────────────────────────────────────────────────────────────────────────┐
│  🔴 REDIS LAYER (Speed)                                                  │
│  ├─ Distributed lock with TTL (5 min countdown)                          │
│  ├─ Sub-millisecond lock acquisition                                     │
│  └─ Automatic expiry prevents abandoned locks                            │
└─────────────────────────────────┬────────────────────────────────────────┘
                                  │
                                  ▼
┌──────────────────────────────────────────────────────────────────────────┐
│  🐘 POSTGRESQL LAYER (Durability)                                        │
│  ├─ SELECT FOR UPDATE with row-level locking                             │
│  ├─ Atomic transactions prevent race conditions                          │
│  └─ Source of truth for booking state                                    │
└─────────────────────────────────┬────────────────────────────────────────┘
                                  │
                                  ▼
┌──────────────────────────────────────────────────────────────────────────┐
│  🔌 SOCKET.IO LAYER (Real-time)                                          │
│  ├─ Instant seat status broadcasts                                       │
│  ├─ Live countdown timers                                                │
│  └─ Multi-user visibility                                                │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## ✨ Features

### Core Booking System
- 🪑 **Interactive Seat Map** — Visual seat selection with real-time availability
- ⏱️ **5-Minute Payment Window** — Locked seats with countdown timer
- 💳 **Stripe Integration** — Secure payment processing with webhook confirmation
- 🔐 **JWT Authentication** — Secure user sessions with HTTP-only cookies
- 📱 **Responsive Design** — Works beautifully on all devices

### Real-time Experience
- ⚡ **Instant Updates** — See other users' selections in real-time via WebSockets
- 🔒 **Live Lock Indicators** — Seats change color when locked by others
- 🔓 **Automatic Unlock** — Expired locks instantly free seats for others
- 📡 **Connection Status** — Visual indicators for socket connectivity

### Concurrency Testing Suite
- 🧪 **Built-in Load Testing** — Simulate up to 500 concurrent users
- 📊 **Live Metrics Dashboard** — Watch lock attempts, conflicts, and bookings in real-time
- 📈 **Collision Rate Analysis** — Measure system performance under load
- 📋 **Event Log** — Detailed trace of every lock/unlock operation

### Fault Tolerance
- 🔄 **Lazy Cleanup** — Secondary cleanup when Redis TTL expires
- 🛡️ **Transaction Rollback** — Automatic DB rollback on Redis failures
- ⚙️ **Background Workers** — Periodic cleanup of stale locks and test data
- 🔍 **Idempotent Operations** — Safe retry handling

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                 FRONTEND                                    │
│                           (Next.js 16 + React 19)                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │   Events    │  │  Seat Map   │  │   Payment   │  │  Concurrency Test   │ │
│  │   Listing   │  │  Component  │  │    Flow     │  │      Dashboard      │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────────────┘ │
└────────────────────────────────┬────────────────────────────────────────────┘
                                 │ REST API + WebSocket
                                 ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                                  BACKEND                                    │
│                            (Express + Socket.IO)                            │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                           API Routes                                 │   │
│  │  /auth    /events    /seats    /payments    /test    /webhook        │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────────────────┐     │
│  │ Seat Controller │  │ Payment Handler │  │   Test Runner (Virtual   │     │
│  │ (Lock/Unlock)   │  │ (Stripe + Book) │  │   Users + Concurrency)   │     │
│  └─────────────────┘  └─────────────────┘  └──────────────────────────┘     │
└───────────────┬──────────────────────────────────────┬──────────────────────┘
                │                                      │
                ▼                                      ▼
┌───────────────────────────┐          ┌───────────────────────────────────────┐
│          REDIS            │          │             POSTGRESQL                │
│                           │          │              (Prisma)                 │
│  • Seat TTL locks         │          │  • Users, Events, Seats               │
│  • 5-minute expiry        │          │  • Bookings (source of truth)         │
│  • Pub/Sub ready          │          │  • Test runs + virtual users          │
└───────────────────────────┘          └───────────────────────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Redis 7+
- Stripe Account (for payments)

### 1. Clone & Install

```bash
git clone https://github.com/yourusername/SeatLock.git
cd SeatLock

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

### 2. Configure Environment

**Backend** (`backend/.env`):
```env
DATABASE_URL="postgresql://user:password@localhost:5432/seatlock"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="your-super-secret-jwt-key"
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
CLIENT_URL="http://localhost:3000"
```

**Frontend** (`frontend/.env.local`):
```env
NEXT_PUBLIC_API_BASE="http://localhost:3001/api"
```

### 3. Setup Database

```bash
cd backend

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed with sample data
npx prisma db seed
```

### 4. Start Development Servers

```bash
# Terminal 1: Backend (port 3001)
cd backend && npm run dev

# Terminal 2: Frontend (port 3000)
cd frontend && npm run dev
```

### 5. Open the App

Navigate to `http://localhost:3000` and start booking seats!

---

## 🧪 Testing Concurrency

SeatLock includes a built-in concurrency testing suite to validate the locking mechanism:

1. Navigate to `/test` in the app
2. Configure:
   - **Virtual Users**: 10-500 concurrent users
   - **Available Seats**: 1-20 seats to compete for
3. Click **"Start Concurrency Test"**
4. Watch the real-time dashboard:
   - 🔵 **Attempts** — Total lock requests
   - 🟢 **Acquired** — Successful locks
   - 🔴 **Rejected** — Failed due to conflicts
   - ✅ **Confirmed** — Completed bookings

The collision rate demonstrates how effectively the system handles contention!

---

## 🔧 API Reference

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Create new user |
| `POST` | `/api/auth/login` | Authenticate & get JWT cookie |
| `POST` | `/api/auth/logout` | Clear auth cookie |
| `GET` | `/api/auth/me` | Get current user |

### Events & Seats
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/events` | List all events |
| `GET` | `/api/events/:id` | Get event with seats |
| `POST` | `/api/seats/lock` | Lock seats (requires auth) |
| `GET` | `/api/seats/:seatId/ttl` | Get lock TTL remaining |

### Payments
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/payments/create-session` | Create Stripe checkout |
| `GET` | `/api/payments/verify-session` | Verify payment success |
| `POST` | `/api/webhook/stripe` | Stripe webhook handler |

### Concurrency Testing
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/test/start` | Start new test run |
| `GET` | `/api/test/:id/status` | Get test progress |
| `GET` | `/api/test/:id/report` | Get final report |

---

## 🎨 UI Highlights

The frontend features a **premium dark theme** with:

- 🌌 **Glass morphism** effects with blur and transparency
- ✨ **Gradient accents** using the brand color palette
- 🎭 **Smooth animations** for state transitions
- 🎪 **Cinema-style seat map** with realistic theater layout
- ⏰ **Animated countdown** for payment window
- 📊 **Real-time dashboards** with live updating metrics

---

## 📁 Project Structure

```
SeatLock/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma      # Database models
│   │   └── seed.ts            # Sample data seeder
│   └── src/
│       ├── controllers/       # Request handlers
│       │   ├── auth.controller.ts
│       │   ├── seat.controller.ts
│       │   ├── payments.controller.ts
│       │   └── test.controller.ts
│       ├── middlewares/       # Auth middleware
│       ├── redis/             # Redis client & TTL logic
│       ├── socket/            # Socket.IO setup
│       ├── stripe/            # Stripe client
│       ├── workers/           # Background cleanup jobs
│       └── routes/            # Express routes
│
└── frontend/
    ├── app/
    │   ├── page.tsx           # Events listing
    │   ├── events/[id]/       # Seat selection
    │   ├── payment/           # Payment flow
    │   ├── test/              # Concurrency testing
    │   └── me/bookings/       # User bookings
    ├── components/
    │   ├── seats/             # Seat map components
    │   ├── auth/              # Login/Register modals
    │   ├── payment/           # Payment countdown
    │   └── ui/                # Shared UI components
    ├── context/               # Auth context
    └── lib/                   # API & socket clients
```

---

## 🔒 Security Considerations

- **HTTP-only cookies** for JWT tokens (XSS protection)
- **CORS configuration** with specific origin allowlist
- **Stripe webhook signature verification**
- **Row-level database locks** prevent race conditions
- **Input validation** on all API endpoints
- **No sensitive data in client-side logs**

---

## 🚧 Future Enhancements

- [ ] Horizontal scaling with Redis Cluster
- [ ] Seat map designer for custom venues
- [ ] Email confirmations via SendGrid
- [ ] Admin dashboard for event management
- [ ] Mobile app with React Native
- [ ] Kubernetes deployment manifests

---

## 🙏 Acknowledgments

Built with modern technologies and best practices for handling distributed systems challenges in real-world booking scenarios.

---

<p align="center">
  <strong>Made with ❤️ and a lot of ☕</strong>
</p>

<p align="center">
  <sub>If you found this helpful, consider giving it a ⭐</sub>
</p>
