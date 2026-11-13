# 🍃 BookLeaf Publishing — Author Support & Communication Portal

> **Full-Stack MERN Platform with Real-Time WebSockets & OpenAI Intelligence (gpt-4o-mini)**

BookLeaf is a self-publishing house producing 1,200+ books per month across a catalog of 22,000+ titles with authors located in India and the US. Authors frequently query about royalties, book production status, ISBN assignment, printing quality, and platform availability. This portal replaces legacy, slow manual communication with an automated, AI-augmented, real-time author support system.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, React Router DOM v7, Tailwind CSS v4, Axios, Socket.io-client |
| **Backend** | Node.js, Express.js (v5), Socket.io, Helmet, Express-Rate-Limit, Morgan |
| **Database** | MongoDB, Mongoose ODM |
| **Authentication** | JSON Web Tokens (JWT), bcryptjs (10 salt rounds) |
| **AI Integration** | OpenAI SDK (`gpt-4o-mini`), JSON Mode classification, Few-shot Knowledge Base |
| **Testing** | Vitest, Supertest, MongoDB In-Memory Server |

---

## 📁 Folder Structure

```
bookleaf-portal/
├── client/                               # Frontend Application (Vite + React)
│   ├── src/
│   │   ├── components/                   # ProtectedRoute with role guards
│   │   ├── context/                      # AuthContext (login, logout, state)
│   │   ├── pages/
│   │   │   ├── Login.jsx                 # Public sign-in portal
│   │   │   ├── author/                   # Author Portal Views
│   │   │   │   ├── AuthorLayout.jsx      # Sidebar, topbar & real-time toast
│   │   │   │   ├── MyBooks.jsx           # Sales, royalties & status tracking
│   │   │   │   ├── SubmitTicket.jsx      # Ticket submission with validation
│   │   │   │   ├── MyTickets.jsx         # Ticket list with live updates
│   │   │   │   └── TicketDetail.jsx      # Query details & response timeline
│   │   │   └── admin/                    # Admin Portal Views
│   │   │       ├── AdminLayout.jsx       # Admin layout & live notifications
│   │   │       ├── AdminDashboard.jsx    # Metric cards & urgent ticket queue
│   │   │       ├── TicketQueue.jsx       # Filterable & searchable ticket queue
│   │   │       └── AdminTicketDetail.jsx # AI draft box, notes & controls
│   │   ├── services/
│   │   │   ├── api.js                    # Axios instance with JWT interceptor
│   │   │   ├── authorService.js          # Author API endpoints
│   │   │   ├── adminService.js           # Admin API endpoints
│   │   │   └── socket.js                 # Socket.io client connection service
│   │   ├── App.jsx                       # Route routing & role-based navigation
│   │   └── main.jsx                      # Vite entry point
│   ├── .env.example                      # Client environment template
│   └── package.json
│
├── server/                               # Backend Application (Node + Express)
│   ├── src/
│   │   ├── config/                       # Database connection (Mongoose)
│   │   ├── controllers/                  # Auth, Book, Ticket & Admin controllers
│   │   ├── middleware/                   # JWT auth, role guard & error handling
│   │   ├── models/                       # User, Book & Ticket Mongoose schemas
│   │   ├── routes/                       # Express route definitions
│   │   ├── socket.js                     # Socket.io server & event emitters
│   │   └── utils/
│   │       ├── ai.js                     # OpenAI classifier & draft generator
│   │       ├── aiPrompts.js              # System & user prompts for AI
│   │       ├── knowledgeBase.js          # Short cached knowledge base (<350 words)
│   │       └── seed.js                   # Seeder (11 users, 18 books)
│   ├── tests/                            # Automated test suite
│   │   ├── auth.test.js                  # Authentication test suite
│   │   ├── ticket.test.js                # Ticket & security test suite
│   │   └── dbHandler.js                  # Test database handler
│   ├── .env.example                      # Server environment template
│   ├── package.json
│   └── server.js                         # Application entry point with Socket.io
│
├── API_DOCS.md                           # Complete REST API reference
├── DEPLOYMENT.md                         # Vercel & Render production deploy guide
├── .env.example                          # Root environment template
└── README.md
```

---

## ⚡ Getting Started

### 1. Prerequisites
- **Node.js** v18+ and npm
- **MongoDB** running locally on port 27017 (or MongoDB Atlas URI)

### 2. Installation
```bash
# Clone the repository
cd bookleaf-portal

# Install server dependencies
cd server
npm install

# Install client dependencies
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
MONGO_URI=mongodb://localhost:27017/bookleaf
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d
PORT=5000
CLIENT_URL=http://localhost:5173
OPENAI_API_KEY=demo
```
*(Set `OPENAI_API_KEY=sk-...` to use live OpenAI GPT-4o-mini; set `OPENAI_API_KEY=demo` to use the built-in compliant mock AI engine without billing).*

### 4. Database Seeding
```bash
cd server
npm run seed
```
Seeds **11 users** (1 Admin + 10 Authors) and **18 books** with verified royalty math (`royaltyPending = royaltyEarned - royaltyPaid`).

### 5. Running the Application
Open two separate terminals:

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

## 🔑 Test Credentials

| Role | Email | Password | Details |
|---|---|---|---|
| **Admin** | `admin@bookleaf.com` | `Admin@123` | Full access to ticket queue & AI controls |
| **Author 1** | `author1@test.com` | `Author@123` | Priya Sharma (3 books, active royalties) |
| **Author 2** | `author2@test.com` | `Author@123` | Rohit Verma (2 books) |
| **Author 3–10**| `author3@test.com` ... `author10@test.com` | `Author@123` | Authors with varied publication statuses |

---

## 📡 API Endpoints Summary

| Method | Route | Role | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register new author account |
| `POST` | `/api/auth/login` | Public | Sign in and receive JWT token |
| `GET` | `/api/auth/me` | Protected | Get authenticated profile data |
| `GET` | `/api/books/my-books` | Author | Retrieve logged-in author's books |
| `POST` | `/api/tickets` | Author | Create ticket with automatic AI classification |
| `GET` | `/api/tickets/my-tickets`| Author | List all tickets created by author |
| `GET` | `/api/tickets/:id` | Author/Admin| Get ticket details (excludes internal notes for author) |
| `GET` | `/api/admin/dashboard` | Admin | Metrics (Open, In Progress, Resolved) & urgent tickets |
| `GET` | `/api/admin/tickets` | Admin | Filter, search, sort, and paginate all tickets |
| `GET` | `/api/admin/tickets/:id`| Admin | Full ticket details including internal notes & AI draft |
| `PATCH` | `/api/admin/tickets/:id/status` | Admin | Update status (`Open`, `In Progress`, `Resolved`, `Closed`) |
| `PATCH` | `/api/admin/tickets/:id/assign` | Admin | Assign ticket to current or designated admin |
| `POST` | `/api/admin/tickets/:id/internal-notes` | Admin | Add note visible only to administrators |
| `POST` | `/api/admin/tickets/:id/respond`| Admin | Send response to author & update status to `In Progress` |
| `PATCH` | `/api/admin/tickets/:id/category`| Admin | Override ticket category (`aiOverridden: true`) |
| `PATCH` | `/api/admin/tickets/:id/priority`| Admin | Override ticket priority (`aiOverridden: true`) |
| `POST` | `/api/admin/tickets/:id/regenerate-draft` | Admin | Regenerate AI response draft on demand |

---

## 🤖 AI Features (OpenAI `gpt-4o-mini`)

1. **Automated Ticket Classification**:
   - Single-call classification extracting `category`, `priority`, `confidence`, and `reason`.
   - Priority rules: Royalty not received >3 months = `Critical`, ISBN mismatch = `High`, Printing defects = `High`, Bio update = `Low`.
2. **Empathetic Auto-Draft Generation**:
   - Draft response signed by Priya (`Team BookLeaf`) adhering to BookLeaf support policy:
     - 80% author / 20% BookLeaf net profit share.
     - Quarterly payouts within 45 days (minimum threshold of Rs. 1,000).
     - 48-hour metadata escalation for ISBN mismatches.
     - 5–7 day free reprints for printing defects upon photo verification.
3. **Cost Optimization**:
   - Short Knowledge Base (<110 words) cached in memory.
   - Minimal book summary sent (`title`, `isbn`, `status`, `royaltyPending`, `mrp`) rather than full histories.
   - Token usage logged to server console (`AI tokens used: ... for ticket ...`).
4. **Resilient Error Handling**:
   - If `OPENAI_API_KEY` is missing or the external API errors (429/500), ticket creation still succeeds (201) with clean fallback and a manual entry notice.

---

## ⚡ Socket.io Real-Time Events

| Event Name | Direction | Room | Payload | Trigger |
|---|---|---|---|---|
| `new_ticket` | Server → Client | `admins` | `{ ticketId, subject, priority }` | Author submits a query |
| `ticket_updated` | Server → Client | `user_${authorId}` | `{ ticketId, status, lastMessage }` | Admin replies or changes status |

- **Author Portal**: Auto-refreshes ticket list and detail view upon receiving `ticket_updated` with real-time notification toasts.
- **Admin Portal**: Displays real-time toast and refreshes ticket queue on `new_ticket`.

---

## 🧪 Automated Testing

The project includes an automated test suite powered by **Vitest** and **Supertest**:

```bash
cd server
npm test
```

### Covered Test Cases:
1. `Login success 200`: Authenticates author and returns valid JWT token.
2. `Login wrong password 401`: Rejects bad credentials.
3. `GET /api/auth/me without token 401`: Blocks unauthenticated user requests.
4. `POST /api/tickets without token 401`: Requires Bearer JWT to submit a ticket.
5. `POST /api/tickets with invalid subject 400`: Validates minimum character lengths.
6. `Author cannot access other author's ticket 403`: Enforces author ticket boundary security.
7. `Admin cannot be accessed by author 403`: Role-based middleware blocks authors from administrative routes.
8. `Internal notes not visible to author`: Verifies `internalNotes` field is stripped from author responses while visible to admins.
