# 🍃 BookLeaf Publishing — Author Support & Communication Portal

> **Production Full-Stack MERN Platform with Real-Time WebSockets & OpenAI Intelligence (`gpt-4o-mini`)**  
> Built for the BookLeaf Publishing Technical Assignment (Full-Stack Developer Position).

---

## 🌐 Live Deployment Links

| Component | Platform | URL |
|---|---|---|
| **Frontend Application** | **Vercel** | [https://localrepo2.vercel.app](https://localrepo2.vercel.app) |
| **Source Code Repository** | **GitHub** | [https://github.com/Yash-bansal123/localrepo2](https://github.com/Yash-bansal123/localrepo2) |
| **Cloud Database** | **MongoDB Atlas** | Seeded with official `bookleaf_sample_data.json` (10 authors, 18 books) |

---

## 🔑 Test Login Credentials

All accounts are pre-seeded in the cloud database. Authors can log in using either their official company email or the convenience alias.

| Role | Official Email | Test Alias | Password | Author & Dataset Details |
|---|---|---|---|---|
| **Admin** | `admin@bookleaf.com` | — | `Admin@123` | Full access to ticket queue, AI drafts, internal notes & controls |
| **Author 1** | `priya.sharma@email.com` | `author1@test.com` | `Author@123` | **Priya Sharma** (Mumbai) — 2 books (*Whispers of the Ganges*, *The Saffron Diaries*) |
| **Author 2** | `rohit.kapoor@email.com` | `author2@test.com` | `Author@123` | **Rohit Kapoor** (Delhi) — 2 books (*Code & Karma*, *Startup Sutra*) |
| **Author 3** | `ananya.reddy@email.com` | `author3@test.com` | `Author@123` | **Ananya Reddy** (Hyderabad) — 1 book (*Between Two Temples*) |
| **Author 4** | `vikram.joshi@email.com` | `author4@test.com` | `Author@123` | **Vikram Joshi** (Pune) — 2 books (*Debugging Life*, *The Last Monsoon*) |
| **Author 5** | `meera.nair@email.com` | `author5@test.com` | `Author@123` | **Meera Nair** (Kochi) — 2 books (*Cardamom & Chaos*, *Letters from Lakshadweep*) |
| **Author 6** | `arjun.malhotra@email.com` | `author6@test.com` | `Author@123` | **Arjun Malhotra** (Chandigarh) — 1 book (*Turban Tales*) |
| **Author 7** | `sneha.kulkarni@email.com` | `author7@test.com` | `Author@123` | **Sneha Kulkarni** (Bangalore) — 3 books (*The Algorithm of Love*, *Ctrl+Alt+Delete My Ex*, *Midnight in Mysore*) |
| **Author 8** | `farhan.sheikh@email.com` | `author8@test.com` | `Author@123` | **Farhan Sheikh** (Lucknow) — 1 book (*Ghazal of the Forgotten*) |
| **Author 9** | `kavita.deshmukh@email.com` | `author9@test.com` | `Author@123` | **Kavita Deshmukh** (Nagpur) — 2 books (*Raising Roots*, *The Nagpur Notebooks*) |
| **Author 10** | `diya.chatterjee@email.com` | `author10@test.com` | `Author@123` | **Diya Chatterjee** (Kolkata) — 2 books (*Durga’s Daughters*, *Howrah Nights*) |

---

## 📋 Project Overview & Problem Context

BookLeaf Publishing is a leading self-publishing company processing **1,200+ books monthly** across an active catalog of **22,000+ titles** with thousands of authors across India and the US. High query volume regarding quarterly royalties, publication pipeline delays, ISBN mismatches, and printing quality historically strained manual operations.

This portal resolves the communication bottleneck through two synchronized interfaces:
1. **Author-Facing Portal**: Self-service tracking of published titles, live royalty financials, guided ticket raising, and real-time response feeds.
2. **Admin-Facing Portal**: Intelligent operations queue with AI auto-classification, priority weighting, empathetic auto-draft responses, internal team notes, and live ticket assignment.

---

## 🛠️ Architecture Decisions & Tech Stack

```
                               ┌───────────────────────────┐
                               │   Vercel: React 18 SPA    │
                               │  (Author & Admin Portals) │
                               └─────────────┬─────────────┘
                                             │
                       HTTPS REST Requests   │   WebSocket Events
                                             ▼
                               ┌───────────────────────────┐
                               │    Render: Node/Express   │
                               │   Socket.io Real-Time     │
                               └───────┬───────────┬───────┘
                                       │           │
                 Mongoose / Strict ODM │           │ OpenAI API SDK
                                       ▼           ▼
                         ┌───────────────────┐   ┌───────────────────────┐
                         │   MongoDB Atlas   │   │  OpenAI gpt-4o-mini   │
                         │  Cloud Database   │   │ (Triage + Auto-Draft) │
                         └───────────────────┘   └───────────────────────┘
```

### Why These Architectural Choices?
* **Node.js & Express.js**: Asynchronous, event-driven runtime ideal for simultaneous I/O operations (WebSocket connections + database pooling + streaming LLM completions).
* **React 18 + Vite**: Instant hot module replacement, optimized production bundling (<130 KB gzipped bundle), and clean component-driven state architecture.
* **MongoDB & Mongoose**: Flexible document model matching author publishing profiles (nested book records, variable publication stages, and multi-platform sales distribution) with indexed queries.
* **Socket.io (WebSockets)**: Bi-directional real-time communication avoiding inefficient client polling. Author rooms (`user_${authorId}`) and admin broadcast rooms (`admins`) provide isolated push notifications.
* **Tailwind CSS v4**: Utility-first styling with zero runtime overhead, responsive flex/grid layouts, and consistent color-coded badges matching operational urgency.

---

## 🤖 AI Integration Details (`gpt-4o-mini`)

The AI integration is designed around strict production engineering criteria:

### 1. Prompt Engineering & Tone
* System prompts explicitly calibrate the AI to respond as **Priya from BookLeaf Author Support** with an empathetic, collaborative, and professional tone.
* Injects authoritative BookLeaf policies from the provided Knowledge Base:
  * 80% Author / 20% BookLeaf net profit royalty split.
  * Quarterly payouts within 45 days (minimum ₹1,000 threshold, rollover rules).
  * 48-hour escalation for ISBN data mismatches.
  * 5–7 day turnaround for free reprints of verified defective copies.
  * 24–48 hour stock re-sync for unavailable Amazon/Flipkart listings.
* Rejects generic AI clichés ("As an AI assistant...") and mandates concrete dates, numbers, and next steps.

### 2. Model Choice Justification: OpenAI `gpt-4o-mini`
* **Speed**: Sub-second latency (~600–900ms) ensures tickets are classified without slowing down the submission UI.
* **Cost Efficiency**: At \$0.15 per 1M input tokens and \$0.60 per 1M output tokens, classification costs less than ₹0.005 per ticket.
* **Reliability & JSON Mode**: Native structured outputs (`response_format: { type: 'json_object' }`) guarantee schema-conformant classifications every time.

### 3. Cost Awareness & Token Optimization
* **Cached Knowledge Base**: The 6-page assignment knowledge base was distilled into a high-density, fact-complete summary (<110 words) cached in memory.
* **Single-Call Triage**: Category classification, priority score, confidence level, and operational reasoning are extracted in a **single LLM call** (<150 tokens) rather than sequential calls.
* **Lightweight Book Context**: Only minimal financial & status attributes are passed to the draft prompt (`title`, `isbn`, `status`, `royaltyPending`, `mrp`), never entire unpruned history.
* **Token Logging**: Every invocation logs exact token consumption (`AI tokens used: ... for ticket ...`) to monitor production spend.

### 4. API Key Security & Graceful Degradation
* **Strict Security**: `OPENAI_API_KEY` is loaded strictly via `process.env`. Never committed to git, never sent to the client bundle.
* **Graceful Degradation**: If `OPENAI_API_KEY` is missing, invalid, or hits OpenAI rate limits (429/500), ticket creation **never fails or crashes**; the system returns HTTP 201 with a clean fallback triage and alerts the admin team to reply manually.
* **Demo / Offline Engine**: If `OPENAI_API_KEY=demo`, a built-in mock engine generates context-accurate classifications and drafts without external API charges.

---

## 📁 Repository Structure

```
bookleaf-portal/
├── client/                               # Frontend Application (Vite + React 18)
│   ├── src/
│   │   ├── components/ProtectedRoute.jsx # Role-based route authorization guards
│   │   ├── context/AuthContext.jsx       # Global authentication state & session recovery
│   │   ├── pages/
│   │   │   ├── Login.jsx                 # Public sign-in portal with test credential hints
│   │   │   ├── author/                   # Author Portal Views
│   │   │   │   ├── AuthorLayout.jsx      # Navigation sidebar, topbar & real-time toast
│   │   │   │   ├── MyBooks.jsx           # Sales, royalties & publication stage tracking
│   │   │   │   ├── SubmitTicket.jsx      # Ticket creation with book selector & file UI
│   │   │   │   ├── MyTickets.jsx         # Ticket list with live status indicators
│   │   │   │   └── TicketDetail.jsx      # Original query & response timeline
│   │   │   └── admin/                    # Admin Operations Views
│   │   │       ├── AdminLayout.jsx       # Admin layout & live notification toasts
│   │   │       ├── AdminDashboard.jsx    # Metric KPI cards & urgent ticket spotlight
│   │   │       ├── TicketQueue.jsx       # Multi-filter, search & priority-sorted queue
│   │   │       └── AdminTicketDetail.jsx # AI draft workspace, internal notes & triage
│   │   ├── services/
│   │   │   ├── api.js                    # Axios instance with production baseURL & JWT interceptor
│   │   │   ├── authorService.js          # Author REST API calls
│   │   │   ├── adminService.js           # Admin REST API calls
│   │   │   └── socket.js                 # Socket.io client service with auto-reconnect
│   │   ├── App.jsx                       # Route routing & role redirects
│   │   └── main.jsx                      # React application entry point
│   ├── vercel.json                       # SPA client routing rewrite rules for Vercel
│   └── package.json
│
├── server/                               # Backend Application (Node.js + Express.js v5)
│   ├── src/
│   │   ├── config/db.js                  # MongoDB Atlas Mongoose connection
│   │   ├── controllers/                  # Auth, Book, Ticket & Admin controller logic
│   │   ├── middleware/                   # JWT auth, role guard & global error handlers
│   │   ├── models/                       # User, Book & Ticket Mongoose schemas
│   │   ├── routes/                       # Express REST endpoints
│   │   ├── socket.js                     # Socket.io authentication & event dispatchers
│   │   ├── data/                         # Official company dataset (bookleaf_sample_data.json)
│   │   └── utils/
│   │       ├── ai.js                     # OpenAI classifier & empathetic draft generator
│   │       ├── aiPrompts.js              # System & user prompts adhering to tone guidelines
│   │       ├── knowledgeBase.js          # High-density cached BookLeaf Knowledge Base
│   │       └── seed.js                   # Seeder populating 1 Admin, 10 Authors, 18 Books
│   ├── tests/                            # Automated test suite (Vitest + Supertest)
│   │   ├── auth.test.js                  # Authentication integration tests
│   │   ├── ticket.test.js                # Ticket security & RBAC isolation tests
│   │   └── dbHandler.js                  # In-memory / test database isolation fixture
│   ├── server.js                         # Application entry point with Socket.io server
│   └── package.json
│
├── API_DOCS.md                           # Complete REST API specification
├── DEPLOYMENT.md                         # Detailed step-by-step deployment guide
├── WRITEUP.md                            # 1-Page technical architecture write-up
└── README.md                             # Main documentation
```

---

## ⚡ Local Setup & Execution Guide

### 1. Prerequisites
- **Node.js** v18+ and npm
- **MongoDB** (local `mongodb://localhost:27017` or MongoDB Atlas URI)

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/Yash-bansal123/localrepo2.git
cd localrepo2

# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### 3. Environment Configuration
Create `.env` inside `server/`:
```bash
cd server
cp .env.example .env
```

Edit `server/.env`:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/bookleaf
JWT_SECRET=your_super_secure_jwt_secret_key_2026
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173
OPENAI_API_KEY=demo
```
*(Use `OPENAI_API_KEY=demo` for zero-cost offline development or paste a live `sk-...` key).*

### 4. Database Seeding
```bash
cd server
npm run seed
```
Seeds **1 Admin**, **10 Authors**, and **18 Books** directly from `bookleaf_sample_data.json`.

### 5. Running Dev Servers
```bash
# Terminal 1: Backend API (port 5000)
cd server
npm run dev

# Terminal 2: Frontend Client (port 5173)
cd client
npm run dev
```
Visit **http://localhost:5173** in your browser.

---

## 🧪 Automated Testing Suite

The backend contains integration test suites covering critical authentication flows, role-based authorization, and confidentiality boundaries:

```bash
cd server
npm test
```

### 8/8 Passing Test Cases:
1. `POST /api/auth/login 200`: Authenticates author with valid credentials and returns signed JWT.
2. `POST /api/auth/login 401`: Rejects incorrect passwords with 401 Unauthorized.
3. `GET /api/auth/me 401`: Rejects unauthenticated profile access without Bearer token.
4. `POST /api/tickets 401`: Rejects unauthenticated ticket submission.
5. `POST /api/tickets 400`: Rejects ticket subjects under 5 characters.
6. `GET /api/tickets/:id 403`: Enforces author boundary (Author 2 blocked from viewing Author 1's ticket).
7. `GET /api/admin/tickets 403`: Role-based middleware blocks non-admin authors from administrative queue.
8. `Internal notes confidentiality`: Strictly verifies `internalNotes` field is stripped from author responses while accessible to admins.

---

## 📡 REST API Reference Summary

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register new author |
| `POST` | `/api/auth/login` | Public | Sign in and receive JWT token |
| `GET` | `/api/auth/me` | Protected | Fetch current user profile |
| `GET` | `/api/books/my-books` | Author | Retrieve logged-in author's books and royalty financials |
| `POST` | `/api/tickets` | Author | Submit new support query (triggers AI auto-classification) |
| `GET` | `/api/tickets/my-tickets` | Author | List all queries submitted by author |
| `GET` | `/api/tickets/:id` | Author/Admin | Query details and conversation timeline (`internalNotes` stripped for author) |
| `GET` | `/api/admin/dashboard` | Admin | Aggregate statistics (Total, Open, In Progress, Resolved) and urgent tickets |
| `GET` | `/api/admin/tickets` | Admin | Filter by status/category/priority, search, and sort queue |
| `GET` | `/api/admin/tickets/:id` | Admin | Full ticket workspace including AI draft and internal notes |
| `PATCH` | `/api/admin/tickets/:id/status` | Admin | Change status (`Open`, `In Progress`, `Resolved`, `Closed`) |
| `PATCH` | `/api/admin/tickets/:id/assign` | Admin | Assign ticket to designated administrator or self |
| `POST` | `/api/admin/tickets/:id/internal-notes` | Admin | Append confidential internal note (audited with admin name & timestamp) |
| `POST` | `/api/admin/tickets/:id/respond` | Admin | Send reply to author (auto-transitions status to `In Progress`) |
| `PATCH` | `/api/admin/tickets/:id/category` | Admin | Override AI category classification (`aiOverridden: true`) |
| `PATCH` | `/api/admin/tickets/:id/priority` | Admin | Override AI priority score (`aiOverridden: true`) |
| `POST` | `/api/admin/tickets/:id/regenerate-draft` | Admin | Re-run AI prompt to generate a new draft response |

*(Full request/response schemas available in [API_DOCS.md](file:///c:/Users/Jarvis/Desktop/Bookleaf%20Publishing/bookleaf-portal/API_DOCS.md)).*

---

## 🔮 Known Limitations & Production Roadmap

Given a production roadmap, the following enhancements would be added:
1. **Cloud File Storage**: The ticket submission form currently supports client-side file attachment validation (UI only, as requested in the brief). In production, this would upload directly to Amazon S3 or Cloudinary with presigned URLs.
2. **Background Job Queue (BullMQ + Redis)**: AI triage and draft generation run synchronously on ticket creation. At 10,000+ tickets/day, moving AI calls to an asynchronous Redis worker queue would ensure sub-100ms API response times.
3. **Email / SMS Webhooks**: Integrating SendGrid / Postmark to dispatch transactional emails to authors whenever an administrator responds to their query.
4. **Author Payout Integration**: Direct payout automation via RazorpayX or Cashfree Payouts API when royalties cross the ₹1,000 threshold at quarter-end.
