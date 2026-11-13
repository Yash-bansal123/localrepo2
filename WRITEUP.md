# 📄 BookLeaf Publishing — Portal Brief Write-Up (1-Page)

## Executive Summary
BookLeaf Publishing operates at high scale, publishing over 1,200 books monthly across an active catalog of 22,000+ titles with authors located in India and the United States. Authors routinely submit repetitive queries regarding royalty disbursements, production stages, ISBN allocations, printing quality, and retail platform availability. Previously managed via manual, fragmented support channels, this volume created backlogs and delayed payouts.

This portal delivers a production-grade, full-stack author communication and support platform powered by real-time WebSockets, automated AI classification, empathetic auto-response generation, and granular role-based security.

---

## 🌐 Live Deployment Links
- **Live Frontend Portal**: [https://localrepo2.vercel.app](https://localrepo2.vercel.app)
- **Live Backend REST API**: [https://bookleaf-api-v9nn.onrender.com](https://bookleaf-api-v9nn.onrender.com)
- **Source Code Repository**: [https://github.com/Yash-bansal123/localrepo2](https://github.com/Yash-bansal123/localrepo2)
- **Test Credentials**:
  - **Admin**: `admin@bookleaf.com` / `Admin@123`
  - **Author**: `priya.sharma@email.com` (or `author1@test.com`) / `Author@123`

---

## Architecture & Technology Stack
- **Frontend**: React 18, Vite, React Router DOM v7, Tailwind CSS v4, Axios (JWT interceptors), Socket.io-client.
- **Backend**: Node.js & Express.js v5, Socket.io (WebSocket engine), Helmet, Express-Rate-Limit, Morgan.
- **Database**: MongoDB Atlas with Mongoose ODM (strict indexing and pre-save bcrypt password hashing).
- **AI Intelligence**: OpenAI `gpt-4o-mini` with JSON Mode response formatting and short in-memory Knowledge Base (<110 words) for maximum cost efficiency.
- **Quality Assurance**: Automated testing via Vitest, Supertest, and isolated database fixtures.

---

## Key Platform Capabilities

### 1. Author Self-Service Portal
- **Dashboard & Royalties**: Aggregated KPI metric cards (Total Books, Copies Sold, Total Royalties, Pending Royalties). Real-time tracking of publication pipeline (from Manuscript Received to Published & Live).
- **Guided Query Submission**: Book-specific or account-wide ticket creation with interactive character limits, instant validation, and UI file attachments.
- **Bidirectional Query Tracking**: Color-coded priority/status chips and complete query conversation history with real-time push updates.

### 2. Administrator Ticket Queue & Management
- **Prioritized Triage Queue**: Dynamic multi-parameter filtering (Status, Category, Priority, Date, Case-insensitive Search) with auto-weighted priority sorting (Critical → High → Medium → Low).
- **Two-Column Case Workspace**: Author profile metrics, publishing history, and book financial data presented alongside administrative action controls.
- **Confidential Internal Notes**: Yellow-badged internal notes for operational auditing, strictly stripped from author payloads at the database controller level.

### 3. AI-Powered Automation (`gpt-4o-mini`)
- **Single-Call Triage**: Automatic classification of category, priority, and confidence score (80–95%) in a single API call (cost-optimized, under 150 tokens).
- **Empathetic Context-Aware Auto-Drafts**: Tailored support drafts pre-populated with BookLeaf business rules (80% net profit share, 45-day quarterly cycles, Rs. 1,000 rollover thresholds, 48-hour escalation). Administrators review, refine, and approve drafts before dispatch.
- **Resilient Fallback Engine**: If OpenAI API keys are absent, throttled, or offline, the platform gracefully defaults without blocking ticket creation or degrading user experience.

### 4. Real-Time WebSockets
- Instant dispatch of `new_ticket` events to administrators and `ticket_updated` events to author rooms, refreshing live UI queues without full-page reloads.

---

## Verification & Production Readiness
- **Automated Tests**: 8/8 comprehensive test cases passing (`vitest run`).
- **Production Build**: 0 errors, 0 warnings (`vite build`).
- **Data Integrity**: Verified database seeding with 1 Admin, 10 Authors, 18 Books directly matching the official `bookleaf_sample_data.json` dataset.
- **Security**: Zero hardcoded secrets, complete `.env` git exclusion, rate-limited auth routes, and Helmet HTTP protection.
