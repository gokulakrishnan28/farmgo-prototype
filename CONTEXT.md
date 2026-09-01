# Project Context: FarmGo Platform Prototype

This file maintains the current project status, completed features, pending tasks, and database connections.

## Project Overview
FarmGo is an AI-powered agricultural logistics platform connecting Farmers with Transporters to move crops efficiently.

## Current Project Status
- **Phase 1 (Architecture)**: Completed. The system architecture, directory structures, database schemas (ERD), and API endpoints are defined in `docs/ARCHITECTURE.md`.
- **Step 1 (Database & Backend Foundation)**: Completed.
  - Directories `/frontend` and `/backend` initialized.
  - Virtual environment and backend dependencies configured.
  - Database connection to Supabase (via Connection Pooler) established and verified.
  - SQLAlchemy models for `User`, `FarmerProfile`, and `TransporterProfile` implemented.
  - Alembic migrations initialized, generated, and applied successfully.
- **Step 2 (Authentication)**: Completed.
  - Custom bcrypt password hashing and verification utility created (avoiding passlib limitations).
  - Pydantic v2 schemas for User, FarmerProfile, and TransporterProfile responses, registrations, and logins implemented.
  - Database CRUD operations for User creation and updating implemented.
  - API routers and endpoints (`POST /register`, `POST /login`, `GET /me`) defined and wired into FastAPI.
  - Automated tests (3 passing) written in `backend/app/tests/test_auth.py` and run successfully.
- **Step 3 (Marketplace Logic)**: Completed.
  - SQLAlchemy models for `crops` and `orders` tables implemented in `backend/app/models/marketplace.py`.
  - Pydantic v2 schemas for Crop and Order validation implemented in `backend/app/schemas/crop.py` and `backend/app/schemas/order.py`.
  - CRUD database helpers for crop listings, transport requests, and order accepting/fulfilling implemented.
  - API endpoints created for Farmers to list crops and request transport, and for Transporters to view, accept, and update transport orders.
  - Automated end-to-end integration tests (passing) written in `backend/app/tests/test_marketplace.py`.
  - Alembic database migration generated and applied successfully.
- **Step 4 (Frontend UI Scaffolding)**: Completed.
  - React 19, TypeScript, and Vite project initialized in the `/frontend` directory.
  - Configured layout dependencies, routing (`react-router-dom`), and styling/icons (`lucide-react`, `tailwindcss`, `@tailwindcss/postcss`).
  - Implemented responsive page layouts for `LandingPage.tsx`, `Farmer/Dashboard.tsx`, and `Transporter/Dashboard.tsx` with role selection flow and interactive mockup dashboards.
  - Set up brand-themed colors and typography (Plus Jakarta Sans) in `index.css`.
  - Verified production build compiles successfully via `npm run build`.
- **AI Feature Integration**: Completed.
  - Created prediction and optimization service layer (`backend/app/services/ai_service.py`).
  - Implemented crop price forecasting with demand scoring and pricing trends.
  - Implemented route optimization with waypoint generation and fuel estimation.
  - Implemented crop spoilage risk prediction based on harvest dates and temperature impact factors.
  - Exposed predictions via endpoints (`/api/v1/ai/price-prediction`, `/api/v1/ai/route-optimization`, and `/api/v1/ai/spoilage-prediction`).
  - Wrote and passed automated unit tests in `backend/app/tests/test_ai.py`.

## Tech Stack Details
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS (v4), shadcn/ui.
- **Backend**: FastAPI (Python), SQLAlchemy, Alembic, JWT Authentication.
- **Database**: PostgreSQL (via Supabase).

## Database Schema (Current State)
- `users`: Standard user profiles with roles (`farmer`, `transporter`, `admin`).
- `farmer_profiles`: Specific profile details for Farmers (linked to `users.id`).
- `transporter_profiles`: Specific profile details for Transporters (linked to `users.id`).
- `crops`: Crop listings owned by farmers (linked to `users.id`).
- `orders`: Transport requests connecting crops, farmers, and transporters.
- `alembic_version`: Tracks applied migrations.

## Pending Steps (Phase 2)
1. **Production Deployment**: Deploy the React frontend to Vercel/Netlify and backend to Vercel/Render.

## Verification Scripts
- **Connection test**: `.\venv\Scripts\python app/test_db_connection.py`
- **Table schema test**: `.\venv\Scripts\python app/verify_tables.py`
- **Authentication tests**: `.\venv\Scripts\python -m pytest app/tests/test_auth.py`
- **Marketplace tests**: `.\venv\Scripts\python -m pytest app/tests/test_marketplace.py`
- **AI services tests**: `.\venv\Scripts\python -m pytest app/tests/test_ai.py`
- **All backend tests**: `.\venv\Scripts\python -m pytest app/tests/`
- **Frontend build test**: `npm run build` (inside `/frontend` directory)
