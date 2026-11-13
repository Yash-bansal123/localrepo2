# 📖 BookLeaf Publishing — API Documentation

Complete reference of all REST API endpoints with request and response examples.

---

## 🔐 Base URL & Headers

- **Base URL**: `http://localhost:5000/api`
- **Default Headers**:
  ```http
  Content-Type: application/json
  Authorization: Bearer <JWT_TOKEN>
  ```

---

## 1. Authentication Endpoints (`/api/auth`)

### 1.1 Register New Author
- **Route**: `POST /api/auth/register`
- **Access**: Public
- **Request Body**:
  ```json
  {
    "name": "Priya Sharma",
    "email": "author1@test.com",
    "password": "Author@123"
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "success": true,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "67a3f5a1e2b4...",
      "name": "Priya Sharma",
      "email": "author1@test.com",
      "role": "author"
    }
  }
  ```

### 1.2 Login
- **Route**: `POST /api/auth/login`
- **Access**: Public
- **Request Body**:
  ```json
  {
    "email": "author1@test.com",
    "password": "Author@123"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "67a3f5a1e2b4...",
      "name": "Priya Sharma",
      "email": "author1@test.com",
      "role": "author"
    }
  }
  ```

### 1.3 Get Current Authenticated User
- **Route**: `GET /api/auth/me`
- **Access**: Private (Author or Admin)
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "user": {
      "id": "67a3f5a1e2b4...",
      "name": "Priya Sharma",
      "email": "author1@test.com",
      "role": "author",
      "bankAccountNumber": "1234567890123456",
      "bankIFSC": "SBIN0001234",
      "bankAccountHolder": "Priya Sharma",
      "createdAt": "2026-11-12T12:00:00.000Z"
    }
  }
  ```

---

## 2. Book Endpoints (`/api/books`)

### 2.1 Get Logged-in Author's Books
- **Route**: `GET /api/books/my-books`
- **Access**: Private (Author only)
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "count": 3,
    "books": [
      {
        "_id": "67a3f5a1e2b5...",
        "title": "The Silent River",
        "isbn": "978-93-12345-01-2",
        "genre": "Fiction",
        "status": "Published & Live",
        "publicationDate": "2025-03-15T00:00:00.000Z",
        "mrp": 299,
        "copiesSold": 1240,
        "royaltyEarned": 18400,
        "royaltyPaid": 12000,
        "royaltyPending": 6400,
        "platformSales": {
          "amazonIn": 520,
          "flipkart": 310,
          "amazonUS": 180,
          "amazonUK": 90,
          "bookleafStore": 140
        }
      }
    ]
  }
  ```

---

## 3. Author Ticket Endpoints (`/api/tickets`)

### 3.1 Create Support Ticket
- **Route**: `POST /api/tickets`
- **Access**: Private (Author)
- **Request Body**:
  ```json
  {
    "subject": "Royalty payment missing for Q2 2025",
    "description": "My book The Silent River shows 1240 copies sold but payout has not reached my bank account.",
    "bookId": "67a3f5a1e2b5...",
    "category": "Royalty & Payments",
    "priority": "High"
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "success": true,
    "ticket": {
      "_id": "67a3f5a1e2b6...",
      "author": "67a3f5a1e2b4...",
      "book": "67a3f5a1e2b5...",
      "subject": "Royalty payment missing for Q2 2025",
      "description": "My book The Silent River shows 1240 copies sold...",
      "category": "Royalty & Payments",
      "priority": "Critical",
      "status": "Open",
      "aiCategory": "Royalty & Payments",
      "aiPriority": "Critical",
      "aiConfidence": 94,
      "aiDraft": "",
      "createdAt": "2026-11-13T09:00:00.000Z"
    }
  }
  ```

### 3.2 Get Author's Tickets
- **Route**: `GET /api/tickets/my-tickets`
- **Access**: Private (Author)
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "count": 1,
    "tickets": [
      {
        "_id": "67a3f5a1e2b6...",
        "subject": "Royalty payment missing for Q2 2025",
        "category": "Royalty & Payments",
        "priority": "Critical",
        "status": "Open",
        "createdAt": "2026-11-13T09:00:00.000Z",
        "book": {
          "_id": "67a3f5a1e2b5...",
          "title": "The Silent River",
          "isbn": "978-93-12345-01-2"
        }
      }
    ]
  }
  ```

### 3.3 Get Ticket by ID (Author View)
- **Route**: `GET /api/tickets/:id`
- **Access**: Private (Author only for own ticket; Admin can view all)
- **Security**: `internalNotes` is completely excluded from author response.
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "ticket": {
      "_id": "67a3f5a1e2b6...",
      "subject": "Royalty payment missing for Q2 2025",
      "description": "My book The Silent River shows 1240 copies sold...",
      "category": "Royalty & Payments",
      "priority": "Critical",
      "status": "In Progress",
      "createdAt": "2026-11-13T09:00:00.000Z",
      "book": {
        "title": "The Silent River",
        "isbn": "978-93-12345-01-2",
        "genre": "Fiction",
        "status": "Published & Live",
        "royaltyPending": 6400,
        "mrp": 299
      },
      "responses": [
        {
          "sender": { "name": "BookLeaf Admin", "role": "admin" },
          "senderRole": "admin",
          "message": "Hello Priya, we have audited your quarterly ledger and queued payout.",
          "createdAt": "2026-11-13T09:15:00.000Z"
        }
      ]
    }
  }
  ```

---

## 4. Admin Management Endpoints (`/api/admin`)

*All routes require Bearer Token with role: `'admin'`.*

### 4.1 Admin Dashboard Metrics
- **Route**: `GET /api/admin/dashboard`
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "stats": {
      "total": 12,
      "open": 4,
      "inProgress": 5,
      "resolved": 3,
      "closed": 0
    },
    "urgent": [
      {
        "_id": "67a3f5a1e2b6...",
        "subject": "Royalty payment missing for Q2 2025",
        "priority": "Critical",
        "status": "Open",
        "category": "Royalty & Payments",
        "createdAt": "2026-11-13T09:00:00.000Z",
        "author": { "name": "Priya Sharma", "email": "author1@test.com" },
        "book": { "title": "The Silent River" }
      }
    ]
  }
  ```

### 4.2 Query All Tickets with Filters
- **Route**: `GET /api/admin/tickets?status=Open&category=Royalty & Payments&priority=Critical&search=river&sort=oldest&page=1&limit=20`
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "total": 1,
    "page": 1,
    "limit": 20,
    "tickets": [
      {
        "_id": "67a3f5a1e2b6...",
        "subject": "Royalty payment missing for Q2 2025",
        "category": "Royalty & Payments",
        "priority": "Critical",
        "status": "Open",
        "author": { "name": "Priya Sharma", "email": "author1@test.com" },
        "book": { "title": "The Silent River", "isbn": "978-93-12345-01-2" },
        "assignedTo": null,
        "createdAt": "2026-11-13T09:00:00.000Z"
      }
    ]
  }
  ```

### 4.3 Get Ticket Details (Admin View)
- **Route**: `GET /api/admin/tickets/:id`
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "authorTotalBooks": 3,
    "ticket": {
      "_id": "67a3f5a1e2b6...",
      "subject": "Royalty payment missing for Q2 2025",
      "description": "My book The Silent River shows 1240 copies sold...",
      "category": "Royalty & Payments",
      "priority": "Critical",
      "status": "Open",
      "aiCategory": "Royalty & Payments",
      "aiPriority": "Critical",
      "aiConfidence": 94,
      "aiDraft": "Hello Priya,\n\nI completely understand your concern regarding delayed royalty...",
      "aiOverridden": false,
      "internalNotes": [
        {
          "note": "Bank details verified with SBI account ending in 3456.",
          "addedBy": { "name": "BookLeaf Admin" },
          "createdAt": "2026-11-13T09:10:00.000Z"
        }
      ],
      "responses": []
    }
  }
  ```

### 4.4 Update Ticket Status
- **Route**: `PATCH /api/admin/tickets/:id/status`
- **Request Body**:
  ```json
  {
    "status": "In Progress"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "ticket": { "_id": "67a3f5a1e2b6...", "status": "In Progress" }
  }
  ```

### 4.5 Assign Ticket
- **Route**: `PATCH /api/admin/tickets/:id/assign`
- **Request Body**:
  ```json
  {
    "assignToMe": true
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "ticket": {
      "_id": "67a3f5a1e2b6...",
      "assignedTo": { "_id": "67a3f5a1e2b0...", "name": "BookLeaf Admin" }
    }
  }
  ```

### 4.6 Add Internal Note (Admin Only)
- **Route**: `POST /api/admin/tickets/:id/internal-notes`
- **Request Body**:
  ```json
  {
    "note": "Author will receive bank transfer confirmation today."
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "ticket": {
      "_id": "67a3f5a1e2b6...",
      "internalNotes": [
        {
          "note": "Author will receive bank transfer confirmation today.",
          "addedBy": { "name": "BookLeaf Admin" }
        }
      ]
    }
  }
  ```

### 4.7 Respond to Ticket
- **Route**: `POST /api/admin/tickets/:id/respond`
- **Request Body**:
  ```json
  {
    "message": "Hello Priya, we reviewed your sales ledger and released the pending payout."
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "ticket": {
      "_id": "67a3f5a1e2b6...",
      "status": "In Progress",
      "responses": [
        {
          "sender": { "name": "BookLeaf Admin", "role": "admin" },
          "senderRole": "admin",
          "message": "Hello Priya, we reviewed your sales ledger...",
          "createdAt": "2026-11-13T09:20:00.000Z"
        }
      ]
    }
  }
  ```

### 4.8 Override AI Category / Priority
- **Route**: `PATCH /api/admin/tickets/:id/category`
  - Body: `{ "category": "Royalty & Payments" }`
- **Route**: `PATCH /api/admin/tickets/:id/priority`
  - Body: `{ "priority": "Critical" }`
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "ticket": {
      "_id": "67a3f5a1e2b6...",
      "priority": "Critical",
      "aiOverridden": true
    }
  }
  ```

### 4.9 Regenerate AI Draft
- **Route**: `POST /api/admin/tickets/:id/regenerate-draft`
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "aiDraft": "Hello Priya,\n\nI apologize for the delay in your quarterly royalty transfer..."
  }
  ```

