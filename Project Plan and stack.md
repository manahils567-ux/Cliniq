# AI Health Vault — Hackathon Project Specification

> **Base:** Cliniq (DoctorOnCall fork) · **Event:** 24-Hour Hackathon · **Team:** 3 people  
> **Theme:** Independence — accessible, self-reliant healthcare for underserved communities

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Problem Statement](#2-problem-statement)
3. [Full Feature List](#3-full-feature-list)
4. [Tech Stack](#4-tech-stack)
5. [Architecture & Folder Structure](#5-architecture--folder-structure)
6. [Database Schema — New Tables](#6-database-schema--new-tables)
7. [API Endpoints](#7-api-endpoints)
8. [Team Task Breakdown](#8-team-task-breakdown)
9. [Setup Instructions](#9-setup-instructions)
10. [Judging Criteria Alignment](#10-judging-criteria-alignment)

---

## 1. Project Overview

**AI Health Vault** is a patient-first healthcare platform built for people who lack consistent access to medical infrastructure — particularly rural and underserved communities in Pakistan and South Asia. It extends a working doctor-appointment system (Cliniq) with three AI-powered features:

| # | Feature | Core Value |
|---|---------|-----------|
| 1 | **AI Health Companion Chatbot** | Ask health questions in English or Urdu; get answers grounded in *your* medical history |
| 2 | **Medical Report Vault** | Upload, organise, and never lose a physical medical document again |
| 3 | **Nearest Hospital Finder** | One tap to find the closest hospital — no address required |

**Tagline:** *"Your health records, your AI doctor, your nearest hospital — all in one place."*

---

## 2. Problem Statement

In rural and semi-urban communities across Pakistan:

- Patients carry physical prescription slips and lab reports in plastic bags — documents are routinely lost, damaged, or left at home during emergencies.
- Consulting a doctor for a simple follow-up question costs time and money most patients cannot afford.
- During a health emergency, most people do not know the address of the nearest hospital.

AI Health Vault solves all three problems without requiring a new app, new account, or new device.

---

## 3. Full Feature List

### Foundation (Cliniq base — untouched)

- [x] Patient, doctor, and admin authentication (JWT)
- [x] Doctor discovery and profile pages
- [x] Appointment booking, tracking, and invoicing
- [x] Prescription issuance and viewing
- [x] Doctor schedule and time-slot management
- [x] Admin dashboard (doctors, patients, transactions, reviews)
- [x] Blog system
- [x] Contact form

### Feature 1 — AI Health Companion Chatbot

- [ ] Floating chat widget on the patient dashboard
- [ ] Powered by Google Gemini API
- [ ] Context-aware: queries patient's own appointments and prescriptions from PostgreSQL before calling Gemini
- [ ] Bilingual: supports English and Urdu in both input and response
- [ ] Graceful fallback message when Gemini is unavailable
- [ ] Conversation is stateless per session (no chat history persisted)
- [ ] Adapted from the Medi-Vault chatbot pattern ([github.com/vigneshkriishna/Medi-Vault](https://github.com/vigneshkriishna/Medi-Vault))

### Feature 2 — Medical Report Vault

- [ ] Patients can upload photos or scans of physical reports (JPEG, PNG, PDF)
- [ ] Upload via Cloudinary (existing integration, new `cliniq/reports/` folder)
- [ ] New `MedicalReport` Prisma model linked to patient ID
- [ ] Report types: Lab Result, Prescription, X-Ray, Discharge Summary, Other
- [ ] Optional reminder date per report — displayed as a badge in the UI
- [ ] "My Reports" page: upload button, card grid, type filter, date sort
- [ ] Delete report (removes Cloudinary file + DB record)

### Feature 3 — Nearest Hospital Finder

- [ ] Patient dashboard widget with a single "Find Hospitals Near Me" button
- [ ] Uses browser Geolocation API to get coordinates
- [ ] Renders Google Maps embed with nearby hospitals (Places API, type: `hospital`)
- [ ] Falls back to a text message if location permission is denied
- [ ] No backend required — runs entirely in the React component

---

## 4. Tech Stack

### Frontend

| Layer | Library / Tool |
|-------|---------------|
| Framework | React 18 (Create React App) |
| State | Redux Toolkit |
| Routing | React Router v6 |
| UI | Ant Design 5 + React Bootstrap |
| HTTP | Axios |
| Forms | React Hook Form |
| Icons | React Icons |
| Maps | Google Maps JavaScript API (embed) |
| Notifications | React Hot Toast |

### Backend

| Layer | Library / Tool |
|-------|---------------|
| Runtime | Node.js ≥ 20 |
| Framework | Express + TypeScript |
| ORM | Prisma 6 |
| Database | PostgreSQL (Supabase) |
| Auth | JWT + bcrypt |
| AI | Google Gemini API (`@google/generative-ai`) |
| File Storage | Cloudinary |
| Email | Nodemailer (Gmail) |
| Validation | Zod |
| Logging | Winston |

### Infrastructure

| Tool | Purpose |
|------|---------|
| Supabase | Managed PostgreSQL (free tier) |
| Cloudinary | Image/file storage (free tier) |
| Vercel / Render | Deployment (optional for demo) |
| Docker | Local dev containerisation |

---

## 5. Architecture & Folder Structure

Only new files are shown. Everything else is the existing Cliniq structure.

```
cliniq/
│
├── src/                                  # React frontend
│   └── components/
│       ├── AI/
│       │   ├── ChatWidget.jsx            # Floating chat bubble + panel
│       │   ├── ChatMessage.jsx           # Single message bubble (user / AI)
│       │   └── ChatWidget.css
│       │
│       ├── MedicalReports/
│       │   ├── MyReports.jsx             # Main "My Reports" page
│       │   ├── ReportCard.jsx            # Single report card
│       │   ├── UploadReportModal.jsx     # Upload form modal
│       │   └── MyReports.css
│       │
│       └── HospitalFinder/
│           ├── HospitalFinder.jsx        # Map widget + geolocation logic
│           └── HospitalFinder.css
│
├── api/
│   └── src/
│       └── app/
│           └── modules/
│               ├── ai/                   # Feature 1
│               │   ├── ai.controller.ts
│               │   ├── ai.service.ts     # Gemini call + DB context builder
│               │   └── ai.route.ts
│               │
│               └── medicalReport/        # Feature 2
│                   ├── medicalReport.controller.ts
│                   ├── medicalReport.service.ts
│                   └── medicalReport.route.ts
│
└── SPEC.md                               # this file
```

### Route Registration

Add two lines to `api/src/app/routes/index.ts`:

```ts
{ path: '/ai',             route: aiRoutes            },
{ path: '/medical-reports', route: medicalReportRoutes },
```

Add two pages to `src/App.jsx`:

```jsx
<Route path='/dashboard/reports'          element={<MyReports />} />
<Route path='/dashboard/hospital-finder'  element={<HospitalFinder />} />
```

---

## 6. Database Schema — New Tables

Add to `api/prisma/schema.prisma`:

```prisma
model MedicalReport {
  id           String    @id @default(uuid())
  patientId    String
  patient      Patient   @relation(fields: [patientId], references: [id])

  title        String
  reportType   ReportType
  fileUrl      String                // Cloudinary secure URL
  filePublicId String                // Cloudinary public ID for deletion
  notes        String?
  reportDate   DateTime?
  reminderDate DateTime?

  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt

  @@map("MedicalReport")
}

enum ReportType {
  labResult
  prescription
  xRay
  dischargeSummary
  other
}
```

Also add the reverse relation to the existing `Patient` model:

```prisma
model Patient {
  // ... existing fields ...
  medicalReports MedicalReport[]
}
```

Run after editing:

```bash
npx prisma db push
```

---

## 7. API Endpoints

### Existing Endpoints (Cliniq base)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/v1/auth/login` | Public | Login |
| POST | `/api/v1/auth/register` | Public | Register |
| GET | `/api/v1/doctor` | Public | List doctors |
| GET | `/api/v1/doctor/:id` | Public | Doctor profile |
| POST | `/api/v1/appointment` | Patient | Book appointment |
| GET | `/api/v1/appointment` | Auth | List appointments |
| GET | `/api/v1/prescription` | Auth | List prescriptions |
| GET | `/api/v1/patient/:id` | Auth | Get patient |
| PATCH | `/api/v1/patient/:id` | Patient | Update patient |

### New Endpoints — Feature 1: AI Chat

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/v1/ai/chat` | Patient | Send a message; returns Gemini response with patient context |

**Request body:**
```json
{
  "message": "What was my last prescription?",
  "language": "en"
}
```

**Response:**
```json
{
  "reply": "Your last prescription dated 3 Aug 2026 was issued by Dr. Ayesha Khan for ...",
  "language": "en"
}
```

### New Endpoints — Feature 2: Medical Report Vault

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/v1/medical-reports` | Patient | Upload a report (multipart/form-data) |
| GET | `/api/v1/medical-reports` | Patient | List all reports for logged-in patient |
| GET | `/api/v1/medical-reports/:id` | Patient | Get single report |
| DELETE | `/api/v1/medical-reports/:id` | Patient | Delete report (Cloudinary + DB) |
| PATCH | `/api/v1/medical-reports/:id/reminder` | Patient | Set or update reminder date |

---

## 8. Team Task Breakdown

> Timeline: **24 hours** · Start: Hour 0 · Demo: Hour 24

### Roles

| Person | Role | Focus Area |
|--------|------|-----------|
| **Dev A** | Full-stack lead | Backend: all 3 new Express modules + Prisma schema |
| **Dev B** | Frontend lead | React: ChatWidget, MyReports page, HospitalFinder |
| **Dev C** | Integration + UX | Wire frontend to API, landing page polish, slides, demo |

---

### Hour-by-Hour Plan

#### Phase 1 — Setup (Hours 0–2)

- [ ] **[All]** Clone repo, run `npm install` in root and `api/`
- [ ] **[Dev A]** Set up Supabase project, fill `api/.env`, run `npx prisma db push`
- [ ] **[Dev B]** Confirm frontend runs locally (`npm start`)
- [ ] **[Dev C]** Obtain Gemini API key, add `GEMINI_API_KEY` to `api/.env`
- [ ] **[Dev A]** Add `MedicalReport` model to schema, push to Supabase
- [ ] **[Dev A]** Install `@google/generative-ai` in `api/`

#### Phase 2 — Core Build (Hours 2–14)

**Dev A — Backend**
- [ ] Build `ai.service.ts`: fetch patient appointments + prescriptions, build Gemini prompt, call API, return bilingual response
- [ ] Build `ai.controller.ts` + `ai.route.ts`, register `/api/v1/ai/chat`
- [ ] Build `medicalReport.service.ts`: Cloudinary upload to `cliniq/reports/`, CRUD, reminder PATCH
- [ ] Build `medicalReport.controller.ts` + `medicalReport.route.ts`
- [ ] Register both new route modules in `api/src/app/routes/index.ts`

**Dev B — Frontend**
- [ ] Build `ChatWidget.jsx`: floating button, slide-up panel, message list, input, send handler, Axios call to `/api/v1/ai/chat`
- [ ] Add language toggle (EN / اردو) in chat UI
- [ ] Build `MyReports.jsx`: grid of `ReportCard` components, filter by type, sort by date
- [ ] Build `UploadReportModal.jsx`: file picker, report type select, notes, reminder date, submit
- [ ] Build `HospitalFinder.jsx`: "Find Hospitals" button → `navigator.geolocation` → Google Maps embed with Places query
- [ ] Add routes in `App.jsx` and nav links in patient sidebar

**Dev C — Integration + UX**
- [ ] Connect `ChatWidget` to Redux auth slice for patient ID in request headers
- [ ] Connect `MyReports` upload and delete flows to backend
- [ ] Connect `HospitalFinder` reminder badge to report list
- [ ] Polish landing page (`LandingPage.jsx`) — ensure Cliniq branding is consistent
- [ ] Handle loading states, error toasts (`react-hot-toast`) across all 3 features

#### Phase 3 — Polish & Demo Prep (Hours 14–22)

- [ ] **[Dev A]** Edge cases: Gemini rate limit fallback, file type validation, auth guards on new routes
- [ ] **[Dev B]** Responsive layout on all new pages, empty states, loading skeletons
- [ ] **[Dev C]** Seed demo data (one patient, a few appointments, a prescription, two uploaded reports)
- [ ] **[All]** End-to-end walkthrough — fix blockers together
- [ ] **[Dev C]** Build 5-slide pitch deck

#### Phase 4 — Submission (Hours 22–24)

- [ ] **[Dev A]** Final `npx prisma db push` on production Supabase
- [ ] **[Dev C]** Deploy frontend (Vercel) and API (Render or same Vercel serverless)
- [ ] **[All]** Record 2-minute demo video
- [ ] **[Dev C]** Submit repo link + demo video + slides

---

## 9. Setup Instructions

### Prerequisites

- Node.js ≥ 20
- npm ≥ 9
- A [Supabase](https://supabase.com) account (free tier)
- A [Cloudinary](https://cloudinary.com) account (free tier)
- A [Google AI Studio](https://aistudio.google.com) API key (Gemini)
- A [Google Maps Platform](https://console.cloud.google.com) API key (Maps JavaScript + Places)

---

### Step 1 — Clone

```bash
git clone <your-repo-url>
cd cliniq
```

### Step 2 — Backend environment

```bash
cp api/.env.example api/.env
```

Fill in `api/.env`:

```env
# Database
DATABASE_URL=postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1

# Auth
JWT_SCRET=your_jwt_secret_here
JWT_EXPIRED_IN=30d
JWT_REFRESH_SECRET=your_refresh_secret_here
JWT_SCRET_SALT_ROUND=10

# Cloudinary
CLOUND_NAME=your_cloudinary_cloud_name
API_KEY=your_cloudinary_api_key
API_SECRET=your_cloudinary_api_secret

# Gmail (for password reset emails)
GMAIL_APP_EMAIL=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password

# AI — NEW
GEMINI_API_KEY=your_gemini_api_key_here

# Google Maps — used in frontend only (add to root .env)
# REACT_APP_GOOGLE_MAPS_KEY=your_google_maps_key_here
```

### Step 3 — Push database schema

```bash
cd api
npm install
npx prisma db push
```

### Step 4 — Install Gemini SDK

```bash
# inside api/
npm install @google/generative-ai
```

### Step 5 — Start backend

```bash
npm run start
# runs on http://localhost:5050
```

### Step 6 — Start frontend

```bash
# new terminal, from project root
npm install
npm start
# runs on http://localhost:3000
```

### Step 7 — Google Maps key (frontend)

Create a `.env` file in the project root:

```env
REACT_APP_GOOGLE_MAPS_KEY=your_google_maps_key_here
```

Reference in `HospitalFinder.jsx`:

```js
const apiKey = process.env.REACT_APP_GOOGLE_MAPS_KEY;
```

---

## 10. Judging Criteria Alignment

| Criterion | Weight | How AI Health Vault scores |
|-----------|--------|---------------------------|
| **Innovation** | 25% | Combines AI + document scanning + location into a single patient-owned health vault. Bilingual Urdu/English AI is uncommon in regional health tech. Addresses the real, undigitised problem of physical paperwork loss. |
| **Technical Implementation** | 25% | Extends a production-quality full-stack codebase (not a prototype). New Prisma model, three Express modules, Cloudinary integration, and three new React pages — all within 24 hours. Clean separation of concerns maintained throughout. |
| **AI Integration** | 20% | Gemini is given *personalised* context (the patient's actual appointments and prescriptions from the DB) before generating a response — not a generic chatbot. Bilingual prompt engineering for Urdu support. |
| **UX** | 15% | Floating chat widget requires zero navigation. Report upload is a single modal. Hospital finder is one button. All flows are designed for low-literacy, mobile-first users. |
| **Independence Theme** | 15% | Directly empowers patients who cannot afford frequent doctor visits: they can ask AI health questions anytime, store their own records without depending on a clinic's filing system, and locate emergency care independently. Urdu language support specifically targets Pakistan's majority non-English-speaking population. |

---

## Appendix — Gemini Prompt Template

```ts
const buildPrompt = (message: string, language: string, context: PatientContext) => `
You are a helpful medical assistant for the Cliniq health platform.
Answer in ${language === 'ur' ? 'Urdu' : 'English'} only.
Be concise, empathetic, and never diagnose — always recommend consulting a doctor for serious concerns.

Patient context:
- Appointments: ${JSON.stringify(context.appointments)}
- Prescriptions: ${JSON.stringify(context.prescriptions)}

Patient question: ${message}
`;
```

---

*Document version 1.0 — AI Health Vault Hackathon Spec*
