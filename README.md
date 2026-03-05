# LeetClone – Coding Platform (Next.js + Prisma + Judge0)

A full-stack **LeetCode-style coding platform** built using modern technologies.  
Users can browse problems, write code, execute it through a self-hosted **Judge0 engine**, and track submissions.

---

# Tech Stack

**Frontend**

- Next.js (App Router)
- React
- Tailwind CSS
- ShadCN UI

**Backend**

- Next.js Server Actions / API Routes
- Prisma ORM
- PostgreSQL

**Authentication**

- Clerk

**Code Execution**

- Judge0 (Self-hosted with Docker)

**Infrastructure**

- Docker
- GitHub

---

# Features

- User authentication (Clerk)
- Problem creation (Admin)
- Code execution with Judge0
- Submission history
- Problem solved tracking
- Playlists for organizing problems
- User profile
- Dark / Light theme

---

# Project Structure (Simplified)

```
app/
 ├─ (auth)/                # Clerk authentication routes
 ├─ (root)/                # Main application routes
 │   ├─ layout.jsx
 │   ├─ page.jsx
 │   └─ problems/
 │
 ├─ api/                   # API routes
 │   ├─ create-problem/
 │   └─ playlists/
 │
modules/
 ├─ navbar.jsx
 ├─ problems/
 └─ profile/

lib/
 └─ db.js                  # Prisma client

prisma/
 └─ schema.prisma
```

---

# See Full Flow

For the complete flow of entire app :

Visit the document:

[Process](https://github.com/wormcracker/leetcode-nextjs-clone/blob/main/process.md)

---

# Installation

## 1️⃣ Clone Repository

```bash
git clone https://github.com/your-username/leetcode-clone.git
cd leetcode-clone
```

---

## 2️⃣ Install Dependencies

```bash
npm install
```

---

# Environment Variables

Create a `.env` file in the root:

```
DATABASE_URL="postgresql://postgres:postgres123@localhost:5435/leetcode"

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/

JUDGE0_API_URL=http://localhost:2358
```

---

# PostgreSQL Setup (Docker)

Create a `docker-compose.yml`:

```yaml
version: "3"

services:
  postgres:
    image: postgres
    container_name: leetcode-db
    ports:
      - "5435:5432"
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres123
      POSTGRES_DB: leetcode
```

Run database:

```bash
docker compose up -d
```

---

# Prisma Setup

Generate client and run migrations:

```bash
npx prisma generate
npx prisma migrate dev
```

---

# Judge0 Setup (Code Execution Engine)

Judge0 runs using Docker.

Clone Judge0:

```bash
git clone https://github.com/judge0/judge0.git
cd judge0
```

Start Judge0 services:

```bash
sudo docker-compose up -d db redis
sleep 10s
sudo docker-compose up -d
```

Judge0 API will run at:

```
http://localhost:2358
```

Your app connects using:

```
JUDGE0_API_URL=http://localhost:2358
```

---

# Run the Application

```bash
npm run dev
```

Open:

```
http://localhost:3000
```

---

# Development Workflow

1. User signs in using **Clerk**
2. User is **onboarded into local database**
3. Problems are fetched from **PostgreSQL via Prisma**
4. User submits code
5. Code is sent to **Judge0**
6. Judge0 executes and returns result
7. Submission result stored in **database**

---

# Key Prisma Models

Main models used:

- `User`
- `Problem`
- `Submission`
- `TestCaseResult`
- `ProblemSolved`
- `Playlist`

These models track users, coding problems, code submissions, and solved status.

---

# Running Judge0 + App Together

Typical development flow:

```
Start PostgreSQL
Start Judge0
Run Next.js app
```

Example:

```bash
docker compose up -d
cd judge0
sudo docker-compose up -d
npm run dev
```

---

# License

MIT License
