# JobTracker AI

A full-stack job search tracker and career pipeline workspace built with **Next.js 16 (App Router)**, **React 19**, **TypeScript**, **Tailwind CSS 4**, and **Prisma ORM** with **PostgreSQL**.

I built this project to solve the fragmentation of modern tech job hunts—replacing messy spreadsheets, loose resume PDFs, and scattered notes with a single, fast workspace that handles application tracking, resume ATS audits, interview prep, and offer evaluation.

---

## Features

### 1. Application Tracking & Kanban Board
- **Table & Kanban Views:** Switch between a detailed applications table and an interactive 4-column drag-and-drop Kanban board (`Applied`, `Interview`, `Offer`, `Rejected`).
- **Optimistic UI:** Stage updates and status transitions update immediately in the UI for seamless interaction, syncing with backend API routes in the background.
- **Smart Follow-Up Reminders:** Automatically flags overdue recruiter follow-ups and upcoming interviews on the dashboard.
- **CSV Export:** Export your entire application pipeline to CSV with UTF-8 BOM encoding for clean Excel and Google Sheets compatibility.

### 2. Resume Vault & ATS Audit
- **Secure File Storage:** Uploaded PDF resumes are validated using magic-byte inspection (`%PDF-`) and stored outside the public directory with randomized UUID filenames.
- **In-Memory Text Extraction:** Uses `unpdf` to extract text in memory without relying on external SaaS APIs or leaking candidate data.
- **ATS Audit Scoring:** Evaluates resume text against a deterministic rubric (scoring 20–98) based on section completeness, strong engineering action verbs, quantifiable metrics, word count, and passive phrase penalties.
- **Resume-to-Job Matching:** Client-side keyword normalization and skill benchmarking across 45+ technical skills to identify missing keywords.

### 3. Application Command Center
- Detailed workspace for each application (`/dashboard/applications/[id]`) with interview timelines, recruiter contacts, and quick links to generate tailored prep materials.
- Quick `mailto:` recruiter reach-out with pre-populated subject lines.

### 4. Networking & Referral CRM
- Track outreach to recruiters, alumni, and colleagues across stages (`Reached Out`, `Call Scheduled`, `Referred`, `Interviewing`, `Closed`).
- Ready-to-use outreach templates formatted for LinkedIn connection notes (<300 characters), coffee chat requests, and recruiter pitches.

### 5. Offer Comparison & Compensation Calculator
- Calculates **1st-Year Total Compensation** vs. **Recurring Annual Compensation** by breaking down base salary, annual bonus, stock/RSU vesting, and sign-on bonus.
- Compares competing offers side-by-side with negotiation talking points and counteroffer email templates.

### 6. Cover Letter & Interview Prep
- Generate tailored cover letter drafts matching tone presets (*Confident*, *Collaborative*, *Direct*).
- Generate role-specific STAR behavioral questions, technical architecture questions, and smart reverse-interview questions.

---

## Tech Stack

- **Framework:** Next.js 16.2 (App Router, Turbopack)
- **Frontend:** React 19, Tailwind CSS 4, Lucide React, Recharts
- **Backend:** Next.js Route Handlers (`app/api/*`)
- **Database:** PostgreSQL with Prisma 7 ORM (`@prisma/adapter-pg`)
- **Authentication:** Custom session-based authentication with `bcrypt` password hashing and SHA-256 session token cookies
- **PDF Processing:** `unpdf` for fast, zero-dependency in-memory PDF parsing
- **Language:** TypeScript 5

---

## Architecture & Engineering Decisions

1. **Why Next.js App Router Monorepo?**  
   Co-locating Server Components, Client Components, and API Route Handlers in a single TypeScript codebase allows end-to-end type sharing with Prisma while eliminating client-side data-fetching waterfalls on initial dashboard loads.

2. **Database Sessions vs. Stateless JWTs:**  
   Session tokens are cryptographically generated (32 random bytes), stored as SHA-256 hashes in the database with a 7-day expiration, and set as `httpOnly`, `SameSite=Lax` cookies. This ensures immediate revocation upon logout without requiring distributed token blocklists.

3. **Deterministic Heuristic Engine vs. Third-Party LLM APIs:**  
   Job parsing, cover letters, outreach pitches, and ATS audits run on deterministic rule-based algorithms, regex parsers, and structured templates. This achieves sub-10ms response times, zero external API costs, and predictable, testable output—while maintaining clean API boundaries for plugging in an LLM SDK later.

4. **Private Storage & Safe File Streaming:**  
   Resumes are saved outside the web root (`private-resumes/`) to prevent direct URL access. Downloads are streamed through an authenticated endpoint with `Cache-Control: private, no-store` and `X-Content-Type-Options: nosniff`.

---

## Database Schema

```prisma
model User {
  id           Int           @id @default(autoincrement())
  name         String
  email        String        @unique
  password     String
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt

  sessions     Session[]
  applications Application[]
  resumes      Resume[]
}

model Session {
  id        Int      @id @default(autoincrement())
  token     String   @unique
  userId    Int
  expiresAt DateTime
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model Application {
  id                Int               @id @default(autoincrement())
  company           String
  role              String
  jobUrl            String?
  location          String
  salary            String?
  status            ApplicationStatus // APPLIED | INTERVIEW | OFFER | REJECTED
  recruiterName     String?
  recruiterEmail    String?
  applicationDate   DateTime
  interviewDate     DateTime?
  followUpDate      DateTime?
  followUpCompleted Boolean           @default(false)
  notes             String?
  userId            Int
  user              User              @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model Resume {
  id        Int      @id @default(autoincrement())
  fileName  String
  filePath  String
  userId    Int
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

---

## Project Structure

```text
job-tracker/
├── app/
│   ├── api/                      # Backend REST API routes
│   │   ├── applications/         # Applications CRUD & parser
│   │   ├── auth/                 # Login, register, logout
│   │   ├── cover-letter/         # Cover letter generator
│   │   ├── interview-prep/       # Interview question generator
│   │   ├── offers/               # Offers & negotiation routes
│   │   ├── referrals/            # Referrals CRM & outreach
│   │   ├── reminders/            # Follow-up & interview reminders
│   │   ├── resumes/              # PDF upload, stream & ATS audit
│   │   └── user/settings/        # Profile & password updates
│   ├── dashboard/                # Protected workspace routes
│   │   ├── analytics/            # Funnel & status charts
│   │   ├── applications/         # Kanban & table views
│   │   ├── cover-letters/        # Cover letter generator tool
│   │   ├── interview-prep/       # Interview prep tool
│   │   ├── offers/               # Compensation comparison
│   │   ├── referrals/            # Networking CRM
│   │   ├── resume/               # Resume vault & ATS audit
│   │   └── settings/             # Account settings
│   └── page.tsx                  # Landing page
├── components/                   # Shared UI, form, and auth components
├── lib/
│   ├── auth.ts                   # Session verification & getCurrentUser
│   ├── local-db.ts               # Local offline database fallback
│   ├── prisma.ts                 # Prisma singleton client
│   └── storage-paths.ts          # Environment-aware file storage paths
└── prisma/
    └── schema.prisma             # Database schema
```

---

## Getting Started

### Prerequisites
- **Node.js** `v20.x` or higher
- **npm** or **pnpm**
- **PostgreSQL** (local instance or cloud database like Neon)

### Setup Instructions

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/job-tracker.git
   cd job-tracker
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the root directory:
   ```env
   # PostgreSQL Connection URL
   DATABASE_URL="postgresql://user:password@localhost:5432/jobtracker?sslmode=require"

   # Secret used for session security
   SESSION_SECRET="your-random-32-byte-secret"
   ```

4. **Push Database Schema:**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Run Development Server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Roadmap

- [ ] Add Next.js `middleware.ts` for centralized edge route protection
- [ ] Migrate PDF binary storage from local disk to AWS S3 / Cloudflare R2
- [ ] Implement OAuth 2.0 (Google and GitHub Sign-In)
- [ ] Integrate Gemini / OpenAI API with streaming for cover letter and interview prep generation
- [ ] Browser extension for 1-click job clipping from LinkedIn and Indeed

---

## License

This project is open-source under the [MIT License](LICENSE).
