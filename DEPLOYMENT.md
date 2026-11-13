# 🚀 BookLeaf Publishing — Production Deployment Guide

Comprehensive instructions for deploying the BookLeaf Portal to production using **Vercel** (Frontend), **Render** (Backend), and **MongoDB Atlas** (Managed Database).

---

## 1. MongoDB Atlas Setup (Cloud Database)

1. **Create Account & Cluster**:
   - Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) and sign in.
   - Click **Create a Deployment** and select the free shared tier (**M0**).
   - Choose a cloud provider and region closest to your backend (e.g., AWS / Mumbai or Frankfurt).

2. **Configure Database User**:
   - Navigate to **Security → Database Access**.
   - Click **Add New Database User**.
   - Authentication Method: **Password**.
   - Assign Role: **Read and write to any database**.
   - Save the username and password safely.

3. **Configure IP Access Whitelist**:
   - Navigate to **Security → Network Access**.
   - Click **Add IP Address**.
   - Select **Allow Access from Anywhere (`0.0.0.0/0`)** to allow cloud hosting (Render) to connect.

4. **Retrieve Connection String**:
   - In **Database Deployments**, click **Connect → Drivers (Node.js)**.
   - Copy connection string URI:
     ```
     mongodb+srv://<username>:<password>@cluster0.mongodb.net/bookleaf?retryWrites=true&w=majority
     ```
   - Replace `<username>` and `<password>` with your created database credentials.

---

## 2. Backend Deployment on Render

1. **Create New Web Service**:
   - Sign in to [render.com](https://render.com).
   - Click **New + → Web Service**.
   - Connect your GitHub repository containing `bookleaf-portal`.

2. **Configure Service Settings**:
   - **Name**: `bookleaf-api`
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**:
     ```bash
     npm install
     ```
   - **Start Command**:
     ```bash
     npm start
     ```
   - **Instance Type**: Free tier

3. **Set Environment Variables**:
   Under **Environment Variables**, add the following keys:
   | Key | Value Description | Example |
   |-----|-------------------|---------|
   | `NODE_ENV` | Production mode | `production` |
   | `PORT` | Web server port | `10000` (Render default) |
   | `MONGO_URI` | Atlas MongoDB connection string | `mongodb+srv://...` |
   | `JWT_SECRET` | 32+ character random string | `e.g. 8f9b4c2...` |
   | `JWT_EXPIRE` | Token validity period | `7d` |
   | `CLIENT_URL` | Deployed Frontend Vercel URL | `https://bookleaf-portal.vercel.app` |
   | `OPENAI_API_KEY` | Paid OpenAI API key (or `demo`) | `sk-proj-...` |

4. **Seed Production Database (Optional)**:
   - In Render dashboard, open the **Shell** tab for the web service.
   - Run:
     ```bash
     npm run seed
     ```
   - Database will seed 11 users and 18 books.

---

## 3. Frontend Deployment on Vercel

1. **Import Project**:
   - Sign in to [vercel.com](https://vercel.com).
   - Click **Add New... → Project**.
   - Connect and select your GitHub repository.

2. **Configure Project Settings**:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `client` (Click Edit and select the `client` directory)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

3. **Set Environment Variables**:
   - Add environment variable:
     - **Key**: `VITE_API_URL`
     - **Value**: `https://<YOUR_RENDER_BACKEND_URL>/api` (e.g. `https://bookleaf-api.onrender.com/api`)

4. **Deploy**:
   - Click **Deploy**. Vercel will build and assign a production URL (e.g., `https://bookleaf-portal.vercel.app`).

---

## 4. Production CORS Configuration

To allow frontend requests and Socket.io handshakes from Vercel to Render:
1. In Render, update the `CLIENT_URL` environment variable:
   ```env
   CLIENT_URL=https://bookleaf-portal.vercel.app
   ```
2. In `server/server.js`, CORS is already configured to automatically allow origins matching `process.env.CLIENT_URL` with credentials support.
3. Socket.io in `server/src/socket.js` automatically syncs with `CLIENT_URL` for real-time WebSocket communication.

---

## 5. Post-Deployment Verification Checklist

- [ ] Visit Vercel frontend URL → Login page loads with SSL (`https`).
- [ ] Login as `admin@bookleaf.com` with `Admin@123` → Redirects to `/admin/dashboard`.
- [ ] Login as `author1@test.com` with `Author@123` → Books and sales load from MongoDB Atlas.
- [ ] Author submits query → Admin receives real-time toast via WebSockets.
- [ ] Admin responds to query → Author receives real-time notification without page reload.

