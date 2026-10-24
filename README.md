# JobTracker AI — Intelligent Career Pipeline & Recruitment Platform

<div align="center">

![Next.js 16](https://img.shields.io/badge/Next.js_16-black?style=for-the-badge&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript_5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS 4](https://img.shields.io/badge/Tailwind_CSS_4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Prisma 7](https://img.shields.io/badge/Prisma_7-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Turbopack](https://img.shields.io/badge/Turbopack-000000?style=for-the-badge&logo=vercel&logoColor=white)

**An enterprise-grade, privacy-first career management and recruitment intelligence suite.**  
*Featuring in-memory PDF parsing, heuristic job description extraction, ATS resume auditing, a networking CRM, and total compensation negotiation modeling.*

</div>

---

## 🌟 Overview

**JobTracker AI** is a full-stack career platform designed to help modern software engineers, tech professionals, and job seekers manage their recruitment pipeline from initial discovery to offer negotiation. 

Unlike traditional spreadsheets or simplistic CRUD trackers, JobTracker AI combines **relational workflow tracking**, **client-side privacy-first PDF intelligence**, and **targeted AI assistants** across all stages of the job hunt.

---

## 🚀 Key Features

### 1. 📋 Application Pipeline & Kanban Board
- **Dual View Modes**: Seamless toggle between a dense data table and an interactive 4-column **Kanban Board** (`Applied`, `Interview`, `Offer`, `Rejected`).
- **One-Click Stage Transitions**: Move applications across stages with optimistic UI updates.
- **Overdue Follow-up Filters**: Automatic date calculation highlighting contacts that require follow-up.
- **Export to CSV**: One-click data export with UTF-8 BOM encoding and formula-injection sanitization for Excel & Google Sheets.

### 2. ⚡ AI Smart Job Description Parser & Auto-fill
- **Frictionless Ingestion**: Paste raw job descriptions from LinkedIn, Indeed, Greenhouse, or Lever.
- **Heuristic Extraction Engine**:
  - Automatically parses **Company**, **Role / Title**, **Location & Work Model** (Remote, Hybrid, Onsite), and **Salary Ranges**.
  - Extracts recruiter contact information (Name & Email).
  - Identifies and chips **key tech stack skills & frameworks**.
  - Formats key responsibilities into bulleted notes with 1-click form population.

### 3. 📄 Private Resume Management & AI ATS Audit
- **Zero-Cloud Privacy**: Uploaded PDF resumes are stored in isolated local storage (`private-resumes/`) and parsed in-memory using `unpdf` without third-party cloud leaks.
- **ATS Clarity & Parseability Audit**:
  - Visual 0–100% parseability score dial.
  - Action-oriented **Power Verb Analyzer** (identifying leadership and technical impact verbs).
  - **Passive Voice Detector** flagging weak phrasing.
  - Structural audit checking for Essential Sections, Quantifiable Metrics, and formatting standards.
- **Job Matching Engine**: Benchmarks resume keyword density against job descriptions with similarity scoring.

### 4. 🎯 Unified Application Command Center (`/dashboard/applications/[id]`)
- **Status Progression Stepper**: One-click stage advancement directly from the application workspace.
- **Integrated Tool Launchpad**: 1-click navigation to generate tailored interview prep, cover letters, referral outreach, or offer evaluations for that specific company.
- **Direct Recruiter Actions**: One-click `mailto:` email composer with pre-filled subject and clipboard copy.
- **Activity & Interview Notes Timeline**: Append timestamped interview feedback, take-home progress, and recruiter notes.

### 5. 🤝 Referrals & Networking CRM (`/dashboard/referrals`)
- **Professional Outreach Pipeline**: Track employee referrals, alumni coffee chats, and recruiter contacts (`Reached Out`, `Call Scheduled`, `Referred`, `Interviewing`, `No Response`).
- **AI Cold Outreach Generator**:
  - **LinkedIn Connection Notes**: Formatted to stay under LinkedIn's strict **300-character limit** with a live character counter.
  - **Alumni Coffee Chat Pitch**: Low-friction 15-minute informational interview request.
  - **Recruiter Direct Pitch**: High-impact value pitch inquiring about engineering headcount.
  - **Polite Follow-up**: Gentle 4-to-6 day bump template.
  - **Copy & Open LinkedIn**: Simultaneous clipboard copy and profile launch.

### 6. 💰 Offer Evaluator & Total Compensation Calculator (`/dashboard/offers`)
- **Total Compensation (TC) Modeling**:
  - Calculates **1st-Year Total Compensation** vs. **Recurring Annual Total Comp**.
  - Granular breakdown of Base Salary, Annual Bonus %, Annual Stock/RSU Vesting, Sign-on Bonus, and 401(k) Match.
- **Side-by-Side Offer Comparison**: Compare competing packages, work models, and decision deadlines.
- **AI Counteroffer & Negotiation Engine**:
  - Generates recommended counter targets (Base vs. Sign-on vs. Equity).
  - Analyzes competing offers for tactical leverage.
  - Generates polished, high-leverage counteroffer email drafts and live recruiter phone call scripts with objection handlers.

### 7. 🤖 AI Cover Letter & Interview Preparation Tools
- **AI Cover Letter Generator**: Generates customized pitch letters referencing verified skills extracted from your uploaded resume. Tone presets include *Confident*, *Collaborative*, and *Direct*.
- **Role-Specific Interview Prep**: Generates 5 STAR behavioral questions with interview tips, 5 technical architecture questions with core concepts, and 4 smart closing questions for the hiring team.

### 8. 📅 Interactive Event Calendar
- Real-time calendar algorithm computing monthly grids with color-coded event dots (cyan for upcoming interview rounds, amber for follow-ups).
- Selected-day agenda panel with direct navigation to scheduled applications.

---

## 🛠️ Technical Architecture & Engineering Decisions

```
┌─────────────────────────────────────────────────────────────┐
│                    Next.js 16 App Router                    │
│      React 19 Server Components + Client Workspaces         │
└──────────────┬───────────────────────────────┬──────────────┘
               │                               │
        Server Actions / API            Static Optimization
               │                               │
┌──────────────▼──────────────┐ ┌──────────────▼──────────────┐
│       Core Relational       │ │      In-Memory Parser       │
│         Prisma 7 ORM        │ │           unpdf             │
│   PostgreSQL (Connection    │ │  (Private disk isolation &  │
│          Pooling)           │ │  zero cloud resume leakage) │
└──────────────┬──────────────┘ └─────────────────────────────┘
               │
┌──────────────▼──────────────┐
│   Atomic User-Scoped Data   │
│   (Referrals CRM & Offers)  │
└─────────────────────────────┘
```

### Key Engineering Highlights:
- **Zero Third-Party PDF Leakage**: Resume text extraction is executed completely in-memory on Node.js using `unpdf` rather than external SaaS parsing APIs, ensuring candidate PII remains secure.
- **Prisma Connection Pooling**: Configured with a `globalThis` singleton client utilizing `@prisma/adapter-pg` to avoid pool exhaustion in serverless or local environments.
- **Optimistic UI & Hydration Safety**: Real-time Kanban transitions, inline date schedulers, and follow-up toggles respond instantaneously on the client while synchronizing with REST endpoints.
- **Heuristic NLP Tokenizer**: Lightweight, deterministic regex and keyword density parsers for job postings and resume audits that execute in milliseconds without external API latency.

---

## 💻 Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router, Turbopack, Server Components) |
| **Language** | [TypeScript 5](https://www.typescriptlang.org/) (Strict mode, full type-safety) |
| **Styling** | [Tailwind CSS 4](https://tailwindcss.com/) with custom glow effects & dark theme |
| **Database & ORM** | [PostgreSQL](https://www.postgresql.org/) & [Prisma 7](https://www.prisma.io/) with `@prisma/adapter-pg` |
| **Authentication** | Custom session tokens with `bcrypt` password hashing |
| **PDF & File Parsing**| [`unpdf`](https://github.com/unjs/unpdf) (fast in-memory PDF extraction) |
| **Icons & Charts** | [`lucide-react`](https://lucide.dev/), [`recharts`](https://recharts.org/) |

---

## 📁 Project Directory Structure

```text
job-tracker/
├── app/
│   ├── api/                      # REST API routes
│   │   ├── applications/         # Application CRUD & AI Job Parser
│   │   ├── auth/                 # Login, Register, Logout
│   │   ├── cover-letter/         # AI Cover Letter Generator
│   │   ├── interview-prep/       # AI Interview Prep Engine
│   │   ├── offers/               # Offers & AI Negotiation Engine
│   │   ├── referrals/            # Referrals CRM & Cold Outreach Engine
│   │   ├── reminders/            # Follow-up & Interview Reminders
│   │   ├── resumes/              # PDF Upload, Text Extraction & ATS Audit
│   │   └── user/settings/        # Account & Password Management
│   ├── dashboard/                # Protected App Router pages
│   │   ├── analytics/            # Conversion & Status Analytics
│   │   ├── applications/         # Table, Kanban & Command Center ([id])
│   │   ├── cover-letters/        # Cover Letter Workspace
│   │   ├── interview-prep/       # STAR & Technical Prep Workspace
│   │   ├── offers/               # Total Compensation & Offer Evaluator
│   │   ├── referrals/            # Referrals CRM & Outreach Generator
│   │   ├── reminders/            # Actionable reminders view
│   │   ├── resume/               # Resume Management & ATS Audit
│   │   ├── resume-match/         # Job Description Match Scoring
│   │   └── settings/             # User Account Settings
│   └── page.tsx                  # Landing / Home Page
├── components/                   # Shared UI components
├── lib/
│   ├── auth.ts                   # Session extraction & verification
│   ├── dashboard-data.ts         # Navigation & sidebar schemas
│   ├── offers-storage.ts         # Offer calculations & atomic storage
│   ├── prisma.ts                 # Prisma Client singleton
│   └── referrals-storage.ts      # Referrals data layer
├── prisma/
│   └── schema.prisma             # PostgreSQL database schema
├── private-resumes/              # Private local disk PDF storage (gitignored)
└── data/                         # Local user workflow data (gitignored)
```

---

## ⚙️ Getting Started

### Prerequisites
- **Node.js**: `v20.x` or higher
- **Package Manager**: `npm` (or `pnpm` / `yarn`)
- **PostgreSQL**: A local or cloud PostgreSQL instance (e.g., Neon, Supabase, or local Docker)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/job-tracker.git
   cd job-tracker
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the root directory:
   ```env
   # PostgreSQL Connection String
   DATABASE_URL="postgresql://username:password@localhost:5432/jobtracker?schema=public"

   # Session Authentication Secret
   SESSION_SECRET="your-super-secret-random-key"
   ```

4. **Initialize Database Schema**:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Start the Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

6. **Build for Production**:
   ```bash
   npm run build
   npm run start
   ```

---

## 🔒 Security & Privacy

- **Git-Ignored Private Storage**: Uploaded PDF resumes (`private-resumes/`) and user data stores (`data/`) are strictly git-ignored to prevent accidental public disclosure of personal identifiable information (PII).
- **Environment Protection**: `.env` and credential files are omitted from source control.
- **CSV Sanitization**: Exported fields are escaped to mitigate CSV Formula Injection attacks.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
