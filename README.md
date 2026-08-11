# Cliniq — Online Doctor Appointments

**A full-stack web app where patients book visits, doctors manage schedules and prescriptions, and admins oversee the system — all in one place.**

## Stack

- **Frontend:** React, Redux Toolkit, Ant Design, React Router v6
- **Backend:** Node.js, Express, TypeScript, Prisma ORM
- **Database:** PostgreSQL (Supabase)
- **Storage:** Cloudinary

## Project Structure

```
cliniq/
├── api/          ← Backend API (Express + Prisma + TypeScript)
│   ├── src/
│   ├── prisma/
│   └── .env      ← Copy from .env.example and fill in
├── src/          ← React frontend
├── public/
└── package.json
```

## Getting Started

### 1. Clone

```bash
git clone <your-repo-url>
cd cliniq
```

### 2. Backend setup

```bash
cd api
npm install
# fill in api/.env (DATABASE_URL, JWT secrets, Cloudinary, Gmail)
npx prisma db push
npm run start
```

### 3. Frontend setup

```bash
cd ..
npm install
npm start
```

## Environment Variables

See `api/.env.example` for all required backend variables.

Key ones to fill in:
- `DATABASE_URL` — Supabase PostgreSQL connection string
- `JWT_SCRET` — JWT signing secret
- `CLOUND_NAME`, `API_KEY`, `API_SECRET` — Cloudinary credentials
- `GMAIL_APP_EMAIL`, `EMAIL_PASS` — Gmail app password for email sending
