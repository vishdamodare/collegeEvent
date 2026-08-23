# College Events Platform — Missing Items & Implementation Roadmap

## Overview & Audit Summary
This audit evaluated the entire codebase against the technical blueprints and design specifications:
- **Planning Blueprint:** `planning.md`
- **Design Specification:** `design.md`
- **Component & Admin Tasks:** `src/task.md`
- **Database Schema:** `prisma/schema.prisma`

---

## 1. Identified Missing Items & Incomplete Components

### 1.1. Admin Registrations Manager (`src/app/admin/registrations/page.tsx`)
- **Status:** **Incomplete / Stub** (Was a simple "Coming Soon" placeholder).
- **Blueprint Reference:** `planning.md` Section 4 & Section 7 (Feature AF-2: Registration Closure & Roster Exports).
- **What was Missing:**
  1. Live attendee data table with search by student name, email, college, roll number, and pass ID.
  2. Event-based filtering and status filtering (Confirmed, Checked-in, Pending, Cancelled).
  3. Interactive Toggle for Event Registration Closure (`isClosed` status).
  4. Full CSV Roster Export with all student academic details.
  5. Direct check-in toggling and pass view shortcuts.

---

### 1.2. Student Dashboard Settings (`src/app/dashboard/settings/page.tsx`)
- **Status:** **Incomplete / Stub** (Was a simple "Coming Soon" placeholder).
- **What was Missing:**
  1. Password / Security credentials update form for students.
  2. Notification preferences toggles (Event reminders, Ticket confirmations, Weekly digest).
  3. Linked account information and profile safety controls.
  4. Backend server actions in `src/actions/profile.ts` for updating student security settings and preferences.

---

### 1.3. Cloudinary Integration & Direct-to-Cloud Upload Signature API
- **Status:** **Missing API & Helper**
- **Blueprint Reference:** `planning.md` Section 1, Section 2, Section 7 (Feature AF-1), Section 11 (`src/lib/cloudinary.ts`).
- **What was Missing:**
  1. `src/lib/cloudinary.ts` utility for server-side Cloudinary configuration, signature generation, and asset deletion.
  2. `src/app/api/cloudinary/sign/route.ts` API route providing secure authenticated upload signatures for direct-to-cloud browser uploads.

---

### 1.4. Attendance & Ticket QR Verification REST API (`/api/attendance/verify`)
- **Status:** **Missing API Endpoint**
- **Blueprint Reference:** `planning.md` Section 15 (Future Expansion Paths: QR Roster Scan via `/api/attendance/verify?ticketId=[id]`).
- **What was Missing:**
  1. Standardized REST API route `src/app/api/attendance/verify/route.ts` supporting GET/POST queries to verify ticket authenticity, validate event ownership, and confirm attendee check-ins for mobile QR scanner integrations.

---

### 1.5. Event Registration Status Toggle Server Action (`toggleEventRegistrationStatusAction`)
- **Status:** **Missing Action**
- **Blueprint Reference:** `planning.md` Section 7 (Feature AF-2: `toggleEventStatusAction(eventId, isClosed)`).
- **What was Missing:**
  1. Server action in `src/actions/admin.ts` allowing event organizers and super admins to instantly lock/freeze or unlock registrations for any event.

---

## 2. Implementation Plan

| Item | File(s) to Create / Modify | Scope & Description |
|---|---|---|
| **1. Admin Registrations** | `src/app/admin/registrations/page.tsx`<br>`src/app/admin/registrations/RegistrationsClient.tsx` | Build the complete attendee roster manager with live search, filters, CSV export, and check-in controls. |
| **2. Event Closure Action** | `src/actions/admin.ts` | Implement `toggleEventRegistrationStatusAction` and `getAdminRegistrationsAction`. |
| **3. Student Settings** | `src/app/dashboard/settings/page.tsx`<br>`src/components/dashboard/StudentSettingsClient.tsx`<br>`src/actions/profile.ts` | Build interactive student settings with password updates and notification preferences. |
| **4. Cloudinary Integration** | `src/lib/cloudinary.ts`<br>`src/app/api/cloudinary/sign/route.ts` | Implement Cloudinary signing endpoint and utility functions. |
| **5. Ticket Verification API** | `src/app/api/attendance/verify/route.ts` | Implement REST endpoint for ticket validation and QR check-in scanning. |

---

## 3. Conflict Prevention Strategy
- All existing Prisma models, Better Auth configurations, UI layouts, and navigation bars will be preserved without breaking changes.
- New server actions and routes follow strict Next.js App Router conventions with TypeScript type-safety.
- All new components seamlessly match the established Anton / Archivo / Inter font hierarchy and Tailwind CSS tokens (`#0B0B08`, `#121212`, `--color-lime`, etc.).
