# DanceLink (DanceCRM)

DanceLink is a role-based platform for dance studios where:
- **Students** search and book dance classes.
- **Studio Owners (Studio Admins)** manage studios, trainers, and class slots.
- **Main Admin** (optional / future) can manage the whole system.

This repository is a **monorepo** (multiple apps in one repo).

---

## 🧩 Project Structure

mobile-main1/
apps/
web-admin/ # Next.js web app (public site + dashboards)
packages/ # shared packages (if added later)


> The main web application lives in: `apps/web-admin`

---

## 👥 Roles & Permissions

### ✅ Student (user)
- Browse/search classes
- Book classes / view bookings
- Manage own profile

### ✅ Instructor / Trainer
- View assigned classes
- Manage own teaching schedule (depends on backend support)

### ✅ Studio Owner (studio admin)
- Manage **owned studios**
- Manage **trainers**
- Create/manage **classes & slots**
- View bookings related to owned studios

### ✅ Main Admin (future / optional)
- Manage all studios and all users
- Global settings and moderation

---

## 🗺️ Main Pages

### Public pages (no login required)
- `/` → **Home / Search Classes**
  - Search by title, studio, trainer, city, date, style, price, availability.
  - Login/Signup button available in header.

### Auth / Account
- Login/Signup opens via modal on home page
- `/profile` → user profile page (when logged in)
- `/reset` → password reset flow (if configured)

### Dashboards (login required)
- `/dashboard` → Redirects user to correct dashboard based on role
- `/dashboard/student` → Student dashboard (bookings, search, map tab)
- `/dashboard/instructor` → Instructor dashboard (classes assigned)
- `/dashboard/owner` → Owner dashboard tabs:
  - **Studios**
  - **Trainers**
  - **Classes & Slots**

---

## ✅ Requirements

### Option A (recommended): Docker
- Docker Desktop installed

### Option B: Local development
- **Node.js 18+**
- npm (or pnpm / yarn)

---

## 🐳 Docker Setup (Recommended)

> If your teacher prefers Docker, this is the best solution.
> If you don’t have Docker configured yet, see the "Local Development" section below.

### 1) Build containers
```bash
docker compose build
2) Run
docker compose up
3) Open app
Web: http://localhost:3000

4) Stop
docker compose down
If you don’t have a docker-compose.yml yet, tell me and I’ll generate it for your project (web + backend + database).

💻 Local Development (No Docker)
1) Install dependencies (root)
From repo root:

npm install
2) Run web app (Next.js)
Go into web app folder:

cd apps/web-admin
npm install
npm run dev
Open:

http://localhost:3000

🏗️ Build for Production
Build
cd apps/web-admin
npm run build
Run production server
npm run start
📜 Available Scripts
Inside apps/web-admin:

Script	Description
npm run dev	Run development server
npm run build	Build for production
npm run start	Run production server
npm run lint	Run lint checks (if configured)
If npm run dev fails in the repo root, run it inside apps/web-admin.

🔐 Environment Variables
Create an .env.local inside:

apps/web-admin/.env.local
Example (update values based on your backend):

NEXT_PUBLIC_API_URL=http://localhost:8000
🧠 Notes (Important)
Home page (/) is public for students browsing classes

Dashboards require login and role-based access

Owner and instructor pages should not be accessible without authentication

✅ Future Improvements
Main admin dashboard

Better analytics for owners

Booking confirmation + notifications

Payments integration

Deployment pipeline

📄 License
For educational use / university project.


---

### Two important things:
1) If you want Docker to be *real*, you need `docker-compose.yml`.  
If you tell me what backend you use (FastAPI? Django? Node?) + database (Postgres?), I can write the full Docker files.

2) You mentioned you got error `"Missing script: dev"` when running from root.  
This README already explains: **run scripts inside `apps/web-admin`**.

If you want, paste your **root `package.json`** and I’ll adjust the README scripts to match exactly your repo.
::contentReference[oaicite:0]{index=0}
You said:

