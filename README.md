# 🎓 CollegeEvents — Where Campus Life Happens

[![Next.js](https://img.shields.io/badge/Next.js-16.2-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-61dafb?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38bdf8?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-7.8-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![Better Auth](https://img.shields.io/badge/Better_Auth-1.6-purple?style=for-the-badge)](https://better-auth.com/)

**CollegeEvents** is a modern, high-performance platform where students discover and register for university events, hackathons, and cultural fests, while campus organizers publish events, manage registrations, issue digital passes, and scan attendees in real-time with optical QR check-in.

---

## ✨ Features

### 👨‍🎓 For Students
- **Campus Event Discovery:** Filter events across colleges, tech categories, hackathons, cultural festivals, and conferences.
- **7-Step Event Registration Wizard:** Seamless flow with profile verification, team creation, team roster configuration, custom dynamic questionnaires, and real-time pass generation.
- **Instant QR Digital Passes:** Generates tamper-proof digital tickets with cryptographic verification tokens and base64 QR codes.
- **Student Dashboard:** Real-time overview of registered events, bookmarked events, downloadable tickets, profile management, and notifications.
- **Social Authentication & Onboarding:** Fast 1-click Google OAuth 2.0 sign-in with automatic onboarding for academic details.

### 🏛️ For Organizers & College Admins
- **Event Creation & Editing:** Create and edit events with hero banner uploads, dynamic categorization, capacity management, and automatic slug generation.
- **Optical QR Check-In Terminal:** Live camera scanner, screenshot upload decoder, and manual search for attendee check-in with duplicate entry protection.
- **Attendance & Registrations Roster:** Live attendee list, check-in status filters, manual override check-in, and team roster inspection.
- **Digital Certificates:** Automated certificate generation and email issuance for verified event attendees.
- **College Profile & Verification:** Multi-tier organizer verification system (`PENDING`, `APPROVED`, `REJECTED`) and college branding.

### 🛡️ Security & Performance
- **Role-Based Access Control (RBAC):** Strict route protection and server action permission checks across `STUDENT`, `ORGANIZER`, and `SUPER_ADMIN`.
- **High-Performance Database Layer:** Prisma 7 with PostgreSQL connection pooling (`pg.Pool`), keep-alive persistence, and SSL libpq compatibility for Neon Serverless Postgres.
- **Accessible & Responsive UI:** Neo-brutalist dark aesthetic with smooth animations, keyboard navigation, and global toast notifications via Sonner.

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | [Next.js 16 (App Router)](https://nextjs.org/) + [React 19](https://react.dev/) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) + Vanilla CSS design tokens |
| **Database & ORM** | [PostgreSQL (Neon)](https://neon.tech/) + [Prisma ORM 7](https://www.prisma.io/) (`@prisma/adapter-pg`) |
| **Authentication** | [Better Auth](https://better-auth.com/) (Google OAuth 2.0 + Email/Password + Session Cookies) |
| **QR & Scanning** | [QRCode](https://www.npmjs.com/package/qrcode) + [jsQR](https://www.npmjs.com/package/jsqr) |
| **Icons & Feedback** | [Lucide React](https://lucide.dev/) + [Sonner](https://sonner.emilkowal.ski/) |
| **Media Storage** | [Cloudinary](https://cloudinary.com/) |

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: `v20.x` or higher
- **npm** or **pnpm** or **yarn**
- **PostgreSQL Database** (e.g. [Neon](https://neon.tech/), Supabase, or local Postgres)

### 2. Clone and Install Dependencies
```bash
git clone https://github.com/vishdamodare/collegeEvent.git
cd collegeEvent
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the root directory based on `.env.example`:

```bash
cp .env.example .env
```

Fill in your configuration:
```env
# Database (PostgreSQL / Neon)
DATABASE_URL="postgresql://username:password@ep-xyz.us-east-1.aws.neon.tech/neondb?sslmode=require&uselibpqcompat=true"

# Better Auth Secret & Base URL
BETTER_AUTH_SECRET="your-super-secret-random-32-char-string"
BETTER_AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Google OAuth 2.0
GOOGLE_CLIENT_ID="your_google_client_id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your_google_client_secret"

# Cloudinary (Optional Media Uploads)
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your_cloud_name"
```

### 4. Setup Database
Push the Prisma schema to your database and seed initial test data:
```bash
npm run db:push
npm run db:seed
```

### 5. Start the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Project Structure

```text
├── prisma/
│   ├── schema.prisma       # Database schema (User, StudentProfile, Event, Registration, Ticket, etc.)
│   └── seed.ts             # Initial colleges, categories, organizers, and sample events
├── src/
│   ├── actions/            # Next.js Server Actions
│   │   ├── admin.ts        # Event CRUD, attendance, and analytics actions
│   │   ├── profile.ts      # Student profile & dashboard queries
│   │   ├── registrations.ts# Event registrations, QR pass creation, and check-in validation
│   │   └── auth/           # Registration and OAuth account linking actions
│   ├── app/                # Next.js App Router
│   │   ├── (auth)/         # Login, signup, and onboarding wizard routes
│   │   ├── admin/          # Organizer admin console (events, check-in, tickets, certificates)
│   │   ├── dashboard/      # Student dashboard (saved events, tickets, profile, settings)
│   │   ├── events/         # Public event directory & event detail pages
│   │   ├── colleges/       # College directory & campus microsites
│   │   └── api/            # Route handlers (auth, cloudinary, certificates)
│   ├── components/         # Modular React Components
│   │   ├── admin/          # Admin forms, table clients, QR scanners
│   │   ├── auth/           # Login/Signup cards, role selection, Google social login
│   │   ├── dashboard/      # Student dashboard shell, settings client, notifications
│   │   └── shared/         # 7-Step Registration Wizard, Navbar, Footer
│   ├── lib/                # Shared utilities (Prisma client, Better Auth, ticket generator)
│   └── proxy.ts            # Route protection and authentication guard
├── auth.md                 # Complete Authentication Architecture & Sequence Diagrams
├── checklist.md            # System Audit & Feature Verification Checklist
└── google_auth.md          # Google Cloud OAuth 2.0 Setup Guide
```

---

## 📜 Key Scripts

- `npm run dev` — Start the local development server on `http://localhost:3000`.
- `npm run build` — Build the optimized production application bundle.
- `npm run start` — Run the production server.
- `npm run db:push` — Push schema changes directly to PostgreSQL.
- `npm run db:seed` — Populate database with default categories, colleges, and events.
- `npm run db:studio` — Open Prisma Studio GUI for database inspection.

---

## 📄 License
This project is licensed under the [MIT License](LICENSE).
