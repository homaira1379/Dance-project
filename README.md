DanceLink (DanceCRM)

DanceLink is a role-based web platform designed for dance studios to manage classes, trainers, and bookings.

The system allows different types of users to interact with the platform based on their roles.

📌 Project Overview

DanceLink provides:

Public class browsing and searching

Booking management for students

Studio and trainer management for owners

Role-based dashboards

This project is built using Next.js and follows a monorepo structure.

🧩 Project Structure
mobile-main1/
│
├── apps/
│   └── web-admin/        # Main Next.js web application
│
├── packages/             # Shared packages (optional / future)
│
└── README.md


👉 Main application location:

apps/web-admin

👥 User Roles & Permissions
✅ Student (User)

Students can:

Browse and search dance classes

Book available classes

Manage their profile

View bookings

✅ Instructor / Trainer

Trainers can:

View assigned classes

Manage teaching schedule (if enabled by backend)

Track student participation

✅ Studio Owner (Studio Admin)

Studio owners can:

Manage studios they own

Manage trainers

Create and manage classes and time slots

View bookings related to their studios

✅ Main Admin (Future Extension)

Main admin may:

Manage all studios and users

Configure global settings

Monitor platform analytics

🗺️ Main Application Pages
🌍 Public Pages (No Login Required)
/

Home page where users can:

Search classes by:

Title

Studio

Trainer

City

Date

Style

Price

Availability

Open Login / Signup modal

🔐 Authentication & Account Pages
Page	Description
Login Modal	Used for sign in & sign up
/profile	User profile management
/reset	Password reset page
📊 Dashboards (Login Required)
/dashboard

Redirects user automatically based on role.

/dashboard/student

Student dashboard includes:

Bookings

Class search

Map view

/dashboard/instructor

Trainer dashboard includes:

Assigned classes

Schedule management

/dashboard/owner

Owner dashboard contains tabs:

Studios

Trainers

Classes & Slots

⚙️ Requirements

Before running the project, install:

Node.js (version 18 or higher)

npm (comes with Node.js)

💻 Installation & Setup
1️⃣ Clone Repository
git clone https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
cd mobile-main1

2️⃣ Install Dependencies

From project root:

npm install

3️⃣ Run Web Application

Navigate to web application folder:

cd apps/web-admin
npm install
npm run dev

4️⃣ Open Application
http://localhost:3000

🏗️ Build & Run Production
Build Application
cd apps/web-admin
npm run build

Start Production Server
npm run start

📜 Available Scripts

Inside apps/web-admin:

Script	Description
npm run dev	Start development server
npm run build	Build application
npm run start	Run production build
npm run lint	Run linting

⚠️ Important:
If npm run dev does not work from root folder, run it inside:

apps/web-admin

🔐 Environment Variables

Create file:

apps/web-admin/.env.local


Example:

NEXT_PUBLIC_API_URL=http://localhost:8000


Update API URL according to backend server.

🧠 Technical Stack

Next.js

React

TypeScript

Tailwind CSS

Role-based Authentication

REST API Integration

🚀 Future Improvements

Main admin dashboard

Payment integration

Notification system

Advanced analytics for studio owners

Mobile application expansion

🎓 Project Purpose

This project is developed for educational purposes and demonstrates:

Full-stack web development

Role-based UI and access control

Modern React & Next.js architecture

Real-world booking system design

📄 License

Educational / University Project Use Only
