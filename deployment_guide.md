# 🚀 FarmGo — Multi-Cloud Deployment Guide

This guide walks you through deploying the **FarmGo** agricultural logistics prototype to production using:
1. 🗄️ **Supabase** (PostgreSQL Database)
2. ⚙️ **Vercel** (FastAPI Python Backend)
3. 🌾 **Netlify** (Vite + React Frontend portals)

---

## 🗄️ PART 1 — Deploying the Database on Supabase

Supabase provides a hosted PostgreSQL instance that is free and fully compatible with SQLAlchemy.

### Step 1.1 — Create a Supabase Project
1. Go to [supabase.com](https://supabase.com) and click **Start your project** (log in using GitHub).
2. Click **New Project** and select your organization.
3. Configure project details:
   - **Name**: `farmgo-db`
   - **Database Password**: Set a strong password (copy this down, e.g., `YourPassword123!`).
   - **Region**: Select a region close to your target users (e.g., `South Asia (Mumbai)` or `Singapore`).
   - **Pricing Plan**: Choose the **Free tier**.
4. Click **Create new project** and wait 2 minutes for the database to provision.

### Step 1.2 — Get your Database Connection String
1. Once your project is ready, navigate to **Project Settings** (gear icon in the sidebar) → **Database**.
2. Scroll down to the **Connection string** section and select **URI**.
3. Copy the URI string. It will look like this:
   `postgresql://postgres.xxxxxx:[YOUR-PASSWORD]@aws-0-ap-south-1.pooler.supabase.com:6543/postgres`
4. Replace `[YOUR-PASSWORD]` with the actual database password you chose in Step 1.1. Keep this URL safe.

### Step 1.3 — Initialize Database Schema (Tables)
You can run Alembic migrations locally to create all necessary tables on Supabase:

1. Open a terminal/PowerShell in your local project root:
   ```powershell
   cd "c:\Users\Gokulakrishnan\Documents\farmGo prototype\backend"
   ```
2. Activate your virtual environment:
   ```powershell
   .\venv\Scripts\activate
   ```
3. Temporarily set your `DATABASE_URL` environment variable to point to your Supabase URI connection string:
   ```powershell
   $env:DATABASE_URL="postgresql://postgres.xxxxxx:YourPassword123!@aws-0-ap-south-1.pooler.supabase.com:6543/postgres"
   ```
4. Run the migration to apply all tables to the database:
   ```powershell
   alembic upgrade head
   ```
5. Verify tables are successfully created:
   ```powershell
   python app/verify_tables.py
   ```
   You should see: `[SUCCESS] All tables are successfully verified in your Supabase database!`

---

## ⚙️ PART 2 — Deploying the Backend on Vercel

Vercel is optimised for hosting serverless Python functions and handles FastAPI routing out-of-the-box.

### Step 2.1 — Import Project to Vercel
1. Go to [vercel.com](https://vercel.com) and log in with GitHub.
2. Click **Add New** → **Project**.
3. Select your `farmgo-prototype` repository.
4. Set up the project configuration:
   - **Framework Preset**: Select **Other**.
   - **Root Directory**: Click **Edit**, select the `backend` folder, and click **Continue**.

### Step 2.2 — Add Environment Variables
Expand the **Environment Variables** panel and add:

| Key | Value | Description |
|-----|-------|-------------|
| `DATABASE_URL` | `postgresql://postgres.xxxxxx:YourPassword123!...` | Your Supabase URI Connection String |
| `SECRET_KEY` | `your-long-random-secret-key-phrase` | Security key for JWT generation |

### Step 2.3 — Deploy
1. Click **Deploy**. Vercel will build the Python environment and make the APIs live.
2. Copy your deployed Backend URL (e.g. `https://farmgo-backend.vercel.app`).

---

## 🌾 PART 3 — Deploying Frontend Portals on Separate Hosts

We deploy three separate projects (Farmer/Transporter Main Host, Admin Portal, and Buyer Portal) from the single repository:

### Step 3.1 — Setup Netlify Redirects (SPA support)
Make sure `_redirects` (`/* /index.html 200`) exists in `public/_redirects` across all 3 portal folders (`frontend`, `admin-portal`, and `buyer-portal`).

### Step 3.2 — Deploy Farmer & Transporter Portal (Main Frontend)
1. Netlify Site Settings:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
2. Environment Variables:
   - `VITE_API_URL`: `https://farmgo-backend.vercel.app`
   - `VITE_ADMIN_PORTAL_URL`: `https://farmgo-admin-console.netlify.app`
   - `VITE_BUYER_PORTAL_URL`: `https://farmgo-buyer-portal.netlify.app`

### Step 3.3 — Deploy Admin Portal
1. Netlify Site Settings:
   - **Site Name**: `farmgo-admin-console`
   - **Base directory**: `admin-portal`
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`

### Step 3.4 — Deploy Buyer Portal
1. Netlify Site Settings:
   - **Site Name**: `farmgo-buyer-portal`
   - **Base directory**: `buyer-portal`
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`

---

## 🔒 PART 4 — Update Backend CORS Settings
Update `CORSMiddleware` in backend:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://farmgo-portal.netlify.app",        # Farmer & Transporter portal (:5173 local)
        "https://farmgo-admin-console.netlify.app",  # Admin portal (:5174 local)
        "https://farmgo-buyer-portal.netlify.app",  # Buyer portal (:5175 local)
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## 🏁 Summary of Multi-Host Architecture

- **Main Landing (Farmer & Transporter Portal)**: `http://localhost:5173` (Prod: `https://farmgo-portal.netlify.app`)
- **Admin Operations Portal**: `http://localhost:5174` (Prod: `https://farmgo-admin-console.netlify.app`)
- **Buyer Procurement Portal**: `http://localhost:5175` (Prod: `https://farmgo-buyer-portal.netlify.app`)
- **FastAPI Backend API**: `http://localhost:8000` (Prod: `https://farmgo-backend.vercel.app`)

