import bcrypt from "bcrypt";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { getDataSubdir } from "@/lib/storage-paths";

export type ApplicationStatus = "APPLIED" | "INTERVIEW" | "OFFER" | "REJECTED";

export type LocalUser = {
  id: number;
  name: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
};

export type LocalSession = {
  id: number;
  token: string;
  userId: number;
  expiresAt: Date;
  createdAt: Date;
};

export type LocalApplication = {
  id: number;
  company: string;
  role: string;
  jobUrl: string | null;
  location: string;
  salary: string | null;
  status: ApplicationStatus;
  recruiterName: string | null;
  recruiterEmail: string | null;
  applicationDate: Date;
  interviewDate: Date | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  followUpDate: Date | null;
  followUpCompleted: boolean;
  userId: number;
};

export type LocalResume = {
  id: number;
  fileName: string;
  filePath: string;
  createdAt: Date;
  userId: number;
};

type SerializedUser = Omit<LocalUser, "createdAt" | "updatedAt"> & {
  createdAt: string;
  updatedAt: string;
};

type SerializedSession = Omit<LocalSession, "expiresAt" | "createdAt"> & {
  expiresAt: string;
  createdAt: string;
};

type SerializedApplication = Omit<
  LocalApplication,
  "applicationDate" | "interviewDate" | "followUpDate" | "createdAt" | "updatedAt"
> & {
  applicationDate: string;
  interviewDate: string | null;
  followUpDate: string | null;
  createdAt: string;
  updatedAt: string;
};

type SerializedResume = Omit<LocalResume, "createdAt"> & {
  createdAt: string;
};

type LocalDatabaseFile = {
  nextIds: {
    user: number;
    session: number;
    application: number;
    resume: number;
  };
  users: SerializedUser[];
  sessions: SerializedSession[];
  applications: SerializedApplication[];
  resumes: SerializedResume[];
};

type WhereClause = Record<string, unknown>;
type OrderByClause =
  | Record<string, "asc" | "desc">
  | Array<Record<string, "asc" | "desc">>;
type SelectClause = Record<string, unknown>;

function getDbFilePath(): string {
  return path.join(getDataSubdir("local-db"), "db.json");
}

function hydrateUser(u: SerializedUser): LocalUser {
  return {
    ...u,
    createdAt: new Date(u.createdAt),
    updatedAt: new Date(u.updatedAt),
  };
}

function serializeUser(u: LocalUser): SerializedUser {
  return {
    ...u,
    createdAt: u.createdAt.toISOString(),
    updatedAt: u.updatedAt.toISOString(),
  };
}

function hydrateSession(s: SerializedSession): LocalSession {
  return {
    ...s,
    expiresAt: new Date(s.expiresAt),
    createdAt: new Date(s.createdAt),
  };
}

function serializeSession(s: LocalSession): SerializedSession {
  return {
    ...s,
    expiresAt: s.expiresAt.toISOString(),
    createdAt: s.createdAt.toISOString(),
  };
}

function hydrateApplication(a: SerializedApplication): LocalApplication {
  return {
    ...a,
    applicationDate: new Date(a.applicationDate),
    interviewDate: a.interviewDate ? new Date(a.interviewDate) : null,
    followUpDate: a.followUpDate ? new Date(a.followUpDate) : null,
    createdAt: new Date(a.createdAt),
    updatedAt: new Date(a.updatedAt),
  };
}

function serializeApplication(a: LocalApplication): SerializedApplication {
  return {
    ...a,
    applicationDate: a.applicationDate.toISOString(),
    interviewDate: a.interviewDate ? a.interviewDate.toISOString() : null,
    followUpDate: a.followUpDate ? a.followUpDate.toISOString() : null,
    createdAt: a.createdAt.toISOString(),
    updatedAt: a.updatedAt.toISOString(),
  };
}

function hydrateResume(r: SerializedResume): LocalResume {
  return {
    ...r,
    createdAt: new Date(r.createdAt),
  };
}

function serializeResume(r: LocalResume): SerializedResume {
  return {
    ...r,
    createdAt: r.createdAt.toISOString(),
  };
}

async function createSeedData(): Promise<LocalDatabaseFile> {
  const now = new Date();
  const dayMs = 24 * 60 * 60 * 1000;
  const isoOffset = (days: number) => new Date(now.getTime() + days * dayMs).toISOString();
  const demoPasswordHash = await bcrypt.hash("Demo@1234", 10);

  return {
    nextIds: {
      user: 2,
      session: 1,
      application: 6,
      resume: 1,
    },
    users: [
      {
        id: 1,
        name: "Demo Candidate",
        email: "demo@jobtracker.ai",
        password: demoPasswordHash,
        createdAt: isoOffset(-14),
        updatedAt: isoOffset(-1),
      },
    ],
    sessions: [],
    applications: [
      {
        id: 1,
        company: "Stripe",
        role: "Full Stack Engineer",
        jobUrl: "https://stripe.com/jobs",
        location: "Remote (US / India)",
        salary: "$145,000 - $170,000",
        status: "INTERVIEW",
        recruiterName: "Maya Lin",
        recruiterEmail: "maya.lin@stripe.example.com",
        applicationDate: isoOffset(-8),
        interviewDate: isoOffset(2),
        followUpDate: isoOffset(1),
        followUpCompleted: false,
        notes:
          "System design and React architecture round scheduled. Focus on TypeScript APIs, PostgreSQL indexing, and clean state management.",
        createdAt: isoOffset(-8),
        updatedAt: isoOffset(-1),
        userId: 1,
      },
      {
        id: 2,
        company: "Vercel",
        role: "Frontend Product Engineer",
        jobUrl: "https://vercel.com/careers",
        location: "Remote",
        salary: "$150,000",
        status: "APPLIED",
        recruiterName: "Alex Rivera",
        recruiterEmail: "alex@vercel.example.com",
        applicationDate: isoOffset(-10),
        interviewDate: null,
        followUpDate: isoOffset(-2),
        followUpCompleted: false,
        notes:
          "Highlighted Next.js App Router, Server Components, and performance optimization experience.",
        createdAt: isoOffset(-10),
        updatedAt: isoOffset(-3),
        userId: 1,
      },
      {
        id: 3,
        company: "Linear",
        role: "Product Engineer",
        jobUrl: "https://linear.app/careers",
        location: "San Francisco / Remote",
        salary: "$165,000 + equity",
        status: "OFFER",
        recruiterName: "Samira Patel",
        recruiterEmail: "samira@linear.example.com",
        applicationDate: isoOffset(-21),
        interviewDate: isoOffset(-5),
        followUpDate: null,
        followUpCompleted: true,
        notes:
          "Received verbal and written offer after final technical review. Evaluating base, equity, and start date.",
        createdAt: isoOffset(-21),
        updatedAt: isoOffset(-1),
        userId: 1,
      },
      {
        id: 4,
        company: "Datadog",
        role: "Software Engineer II",
        jobUrl: "https://careers.datadoghq.com",
        location: "New York, NY",
        salary: "$140,000",
        status: "APPLIED",
        recruiterName: null,
        recruiterEmail: null,
        applicationDate: isoOffset(-4),
        interviewDate: null,
        followUpDate: isoOffset(4),
        followUpCompleted: false,
        notes:
          "Applied with tailored backend + observability resume.",
        createdAt: isoOffset(-4),
        updatedAt: isoOffset(-4),
        userId: 1,
      },
      {
        id: 5,
        company: "Notion",
        role: "Software Engineer, Core Product",
        jobUrl: "https://notion.so/careers",
        location: "Hybrid - Bengaluru",
        salary: null,
        status: "REJECTED",
        recruiterName: "Jordan Kim",
        recruiterEmail: null,
        applicationDate: isoOffset(-18),
        interviewDate: null,
        followUpDate: null,
        followUpCompleted: true,
        notes:
          "Completed take-home assessment; position filled internally.",
        createdAt: isoOffset(-18),
        updatedAt: isoOffset(-7),
        userId: 1,
      },
    ],
    resumes: [],
  };
}

let queue: Promise<void> = Promise.resolve();

function withLock<T>(task: () => Promise<T>): Promise<T> {
  const result = queue.then(task, task);
  queue = result.then(
    () => undefined,
    () => undefined
  );
  return result;
}

async function readDb(): Promise<LocalDatabaseFile> {
  const filePath = getDbFilePath();
  await mkdir(path.dirname(filePath), { recursive: true });

  try {
    const raw = await readFile(filePath, "utf8");
    return JSON.parse(raw) as LocalDatabaseFile;
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code === "ENOENT") {
      const seed = await createSeedData();
      await writeFile(filePath, JSON.stringify(seed, null, 2), "utf8");
      return seed;
    }
    throw error;
  }
}

async function writeDb(db: LocalDatabaseFile): Promise<void> {
  const filePath = getDbFilePath();
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, JSON.stringify(db, null, 2), "utf8");
}

function toTimestamp(val: unknown): number {
  if (val instanceof Date) return val.getTime();
  if (typeof val === "string" || typeof val === "number") {
    return new Date(val).getTime();
  }
  return NaN;
}

function matchesFilterValue(fieldVal: unknown, condition: unknown): boolean {
  if (
    condition !== null &&
    typeof condition === "object" &&
    !(condition instanceof Date) &&
    !Array.isArray(condition)
  ) {
    const ops = condition as Record<string, unknown>;

    if ("not" in ops) {
      if (ops.not === null) {
        if (fieldVal === null || fieldVal === undefined) return false;
      } else if (fieldVal === ops.not) {
        return false;
      }
    }

    if ("in" in ops && Array.isArray(ops.in)) {
      if (!ops.in.includes(fieldVal)) return false;
    }

    if ("notIn" in ops && Array.isArray(ops.notIn)) {
      if (ops.notIn.includes(fieldVal)) return false;
    }

    const dateOps = ["lt", "lte", "gt", "gte"] as const;
    for (const op of dateOps) {
      if (op in ops && ops[op] !== undefined) {
        if (fieldVal === null || fieldVal === undefined) return false;
        const left = toTimestamp(fieldVal);
        const right = toTimestamp(ops[op]);
        if (Number.isNaN(left) || Number.isNaN(right)) return false;
        if (op === "lt" && !(left < right)) return false;
        if (op === "lte" && !(left <= right)) return false;
        if (op === "gt" && !(left > right)) return false;
        if (op === "gte" && !(left >= right)) return false;
      }
    }

    return true;
  }

  if (fieldVal instanceof Date && condition instanceof Date) {
    return fieldVal.getTime() === condition.getTime();
  }

  return fieldVal === condition;
}

function matchesWhere(
  row: Record<string, unknown>,
  where?: WhereClause
): boolean {
  if (!where) return true;

  for (const [key, cond] of Object.entries(where)) {
    if (cond === undefined) continue;

    if (key === "OR" && Array.isArray(cond)) {
      const anyMatch = cond.some((sub) =>
        matchesWhere(row, sub as WhereClause)
      );
      if (!anyMatch) return false;
      continue;
    }

    if (key === "AND" && Array.isArray(cond)) {
      const allMatch = cond.every((sub) =>
        matchesWhere(row, sub as WhereClause)
      );
      if (!allMatch) return false;
      continue;
    }

    if (!matchesFilterValue(row[key], cond)) {
      return false;
    }
  }

  return true;
}

function compareValues(a: unknown, b: unknown): number {
  if (a === b) return 0;
  if (a === null || a === undefined) return -1;
  if (b === null || b === undefined) return 1;
  if (a instanceof Date && b instanceof Date) return a.getTime() - b.getTime();
  if (typeof a === "number" && typeof b === "number") return a - b;
  return String(a).localeCompare(String(b));
}

function sortRows<T extends Record<string, unknown>>(
  rows: T[],
  orderBy?: OrderByClause
): T[] {
  if (!orderBy) return rows;
  const clauses = Array.isArray(orderBy) ? orderBy : [orderBy];
  const entries = clauses.flatMap((c) => Object.entries(c));
  if (entries.length === 0) return rows;

  return [...rows].sort((a, b) => {
    for (const [field, dir] of entries) {
      const cmp = compareValues(a[field], b[field]);
      if (cmp !== 0) {
        return dir === "desc" ? -cmp : cmp;
      }
    }
    return 0;
  });
}

function applySelect(
  row: Record<string, unknown>,
  select?: SelectClause,
  extra?: Record<string, unknown>
): Record<string, unknown> {
  if (!select) {
    return extra ? { ...row, ...extra } : { ...row };
  }

  const out: Record<string, unknown> = {};
  for (const [key, enabled] of Object.entries(select)) {
    if (!enabled) continue;
    if (key === "_count" && extra && "_count" in extra) {
      out._count = extra._count;
    } else if (key in row) {
      out[key] = row[key];
    }
  }
  return out;
}

function toDateOrNull(val: unknown): Date | null {
  if (val === null || val === undefined || val === "") return null;
  return val instanceof Date ? val : new Date(String(val));
}

export function createLocalPrismaClient() {
  return {
    user: {
      findUnique: async (args: {
        where: { id?: number; email?: string };
        select?: SelectClause;
      }) =>
        withLock(async () => {
          const db = await readDb();
          const found = db.users.find((u) => {
            if (args.where.id !== undefined) return u.id === args.where.id;
            if (args.where.email !== undefined) return u.email === args.where.email;
            return false;
          });
          if (!found) return null;

          const hydrated = hydrateUser(found);
          const countObj = {
            applications: db.applications.filter((a) => a.userId === hydrated.id).length,
            resumes: db.resumes.filter((r) => r.userId === hydrated.id).length,
          };

          return applySelect(hydrated, args.select, { _count: countObj });
        }),

      create: async (args: {
        data: { name: string; email: string; password: string };
        select?: SelectClause;
      }) =>
        withLock(async () => {
          const db = await readDb();
          const now = new Date();
          const user: LocalUser = {
            id: db.nextIds.user++,
            name: args.data.name,
            email: args.data.email,
            password: args.data.password,
            createdAt: now,
            updatedAt: now,
          };
          db.users.push(serializeUser(user));
          await writeDb(db);
          return applySelect(user, args.select);
        }),

      update: async (args: {
        where: { id: number };
        data: Partial<{ name: string; email: string; password: string }>;
        select?: SelectClause;
      }) =>
        withLock(async () => {
          const db = await readDb();
          const idx = db.users.findIndex((u) => u.id === args.where.id);
          if (idx === -1) {
            throw new Error("User not found.");
          }

          const current = hydrateUser(db.users[idx]);
          const updated: LocalUser = {
            ...current,
            ...args.data,
            updatedAt: new Date(),
          };
          db.users[idx] = serializeUser(updated);
          await writeDb(db);
          return applySelect(updated, args.select);
        }),
    },

    session: {
      findUnique: async (args: {
        where: { id?: number; token?: string };
        include?: { user?: boolean };
      }) =>
        withLock(async () => {
          const db = await readDb();
          const found = db.sessions.find((s) => {
            if (args.where.token !== undefined) return s.token === args.where.token;
            if (args.where.id !== undefined) return s.id === args.where.id;
            return false;
          });
          if (!found) return null;

          const hydrated = hydrateSession(found);
          if (args.include?.user) {
            const rawUser = db.users.find((u) => u.id === hydrated.userId);
            if (!rawUser) return null;
            return { ...hydrated, user: hydrateUser(rawUser) };
          }
          return hydrated;
        }),

      create: async (args: {
        data: { token: string; userId: number; expiresAt: Date | string };
      }) =>
        withLock(async () => {
          const db = await readDb();
          const session: LocalSession = {
            id: db.nextIds.session++,
            token: args.data.token,
            userId: args.data.userId,
            expiresAt:
              args.data.expiresAt instanceof Date
                ? args.data.expiresAt
                : new Date(args.data.expiresAt),
            createdAt: new Date(),
          };
          db.sessions.push(serializeSession(session));
          await writeDb(db);
          return session;
        }),

      delete: async (args: { where: { id: number } }) =>
        withLock(async () => {
          const db = await readDb();
          const idx = db.sessions.findIndex((s) => s.id === args.where.id);
          if (idx === -1) {
            throw new Error("Session not found.");
          }
          const [removed] = db.sessions.splice(idx, 1);
          await writeDb(db);
          return hydrateSession(removed);
        }),

      deleteMany: async (args: { where?: WhereClause }) =>
        withLock(async () => {
          const db = await readDb();
          const before = db.sessions.length;
          db.sessions = db.sessions.filter(
            (s) => !matchesWhere(hydrateSession(s), args.where)
          );
          const count = before - db.sessions.length;
          if (count > 0) {
            await writeDb(db);
          }
          return { count };
        }),
    },

    application: {
      count: async (args?: { where?: WhereClause }) =>
        withLock(async () => {
          const db = await readDb();
          const rows = db.applications
            .map(hydrateApplication)
            .filter((a) => matchesWhere(a, args?.where));
          return rows.length;
        }),

      findMany: async (args?: {
        where?: WhereClause;
        orderBy?: OrderByClause;
        select?: SelectClause;
        take?: number;
      }) =>
        withLock(async () => {
          const db = await readDb();
          let rows = db.applications
            .map(hydrateApplication)
            .filter((a) => matchesWhere(a, args?.where));
          rows = sortRows(rows, args?.orderBy);
          if (args?.take !== undefined) {
            rows = rows.slice(0, args.take);
          }
          return rows.map((r) => applySelect(r, args?.select));
        }),

      findFirst: async (args?: {
        where?: WhereClause;
        orderBy?: OrderByClause;
        select?: SelectClause;
      }) =>
        withLock(async () => {
          const db = await readDb();
          let rows = db.applications
            .map(hydrateApplication)
            .filter((a) => matchesWhere(a, args?.where));
          rows = sortRows(rows, args?.orderBy);
          if (rows.length === 0) return null;
          return applySelect(rows[0], args?.select);
        }),

      findUnique: async (args: {
        where: { id: number };
        select?: SelectClause;
      }) =>
        withLock(async () => {
          const db = await readDb();
          const found = db.applications.find((a) => a.id === args.where.id);
          if (!found) return null;
          return applySelect(hydrateApplication(found), args.select);
        }),

      create: async (args: {
        data: Record<string, unknown>;
        select?: SelectClause;
      }) =>
        withLock(async () => {
          const db = await readDb();
          const now = new Date();
          const d = args.data;
          const app: LocalApplication = {
            id: db.nextIds.application++,
            company: String(d.company),
            role: String(d.role),
            jobUrl: (d.jobUrl as string | null) ?? null,
            location: String(d.location),
            salary: (d.salary as string | null) ?? null,
            status: d.status as ApplicationStatus,
            recruiterName: (d.recruiterName as string | null) ?? null,
            recruiterEmail: (d.recruiterEmail as string | null) ?? null,
            applicationDate: toDateOrNull(d.applicationDate) ?? now,
            interviewDate: toDateOrNull(d.interviewDate),
            followUpDate: toDateOrNull(d.followUpDate),
            followUpCompleted:
              typeof d.followUpCompleted === "boolean"
                ? d.followUpCompleted
                : false,
            notes: (d.notes as string | null) ?? null,
            createdAt: now,
            updatedAt: now,
            userId: Number(d.userId),
          };
          db.applications.push(serializeApplication(app));
          await writeDb(db);
          return applySelect(app, args.select);
        }),

      update: async (args: {
        where: { id: number };
        data: Record<string, unknown>;
        select?: SelectClause;
      }) =>
        withLock(async () => {
          const db = await readDb();
          const idx = db.applications.findIndex((a) => a.id === args.where.id);
          if (idx === -1) {
            throw new Error("Application not found.");
          }

          const current = hydrateApplication(db.applications[idx]);
          const d = args.data;
          const updated: LocalApplication = {
            ...current,
            ...(d.company !== undefined ? { company: String(d.company) } : {}),
            ...(d.role !== undefined ? { role: String(d.role) } : {}),
            ...(d.location !== undefined ? { location: String(d.location) } : {}),
            ...(d.jobUrl !== undefined ? { jobUrl: (d.jobUrl as string | null) ?? null } : {}),
            ...(d.salary !== undefined ? { salary: (d.salary as string | null) ?? null } : {}),
            ...(d.status !== undefined ? { status: d.status as ApplicationStatus } : {}),
            ...(d.recruiterName !== undefined
              ? { recruiterName: (d.recruiterName as string | null) ?? null }
              : {}),
            ...(d.recruiterEmail !== undefined
              ? { recruiterEmail: (d.recruiterEmail as string | null) ?? null }
              : {}),
            ...(d.notes !== undefined ? { notes: (d.notes as string | null) ?? null } : {}),
            ...(d.applicationDate !== undefined
              ? { applicationDate: toDateOrNull(d.applicationDate) ?? current.applicationDate }
              : {}),
            ...(d.interviewDate !== undefined
              ? { interviewDate: toDateOrNull(d.interviewDate) }
              : {}),
            ...(d.followUpDate !== undefined
              ? { followUpDate: toDateOrNull(d.followUpDate) }
              : {}),
            ...(d.followUpCompleted !== undefined
              ? { followUpCompleted: Boolean(d.followUpCompleted) }
              : {}),
            updatedAt: new Date(),
          };
          db.applications[idx] = serializeApplication(updated);
          await writeDb(db);
          return applySelect(updated, args.select);
        }),

      updateMany: async (args: {
        where?: WhereClause;
        data: Record<string, unknown>;
      }) =>
        withLock(async () => {
          const db = await readDb();
          let count = 0;
          const now = new Date();
          const d = args.data;

          db.applications = db.applications.map((raw) => {
            const hydrated = hydrateApplication(raw);
            if (!matchesWhere(hydrated, args.where)) return raw;
            count++;
            const updated: LocalApplication = {
              ...hydrated,
              ...(d.followUpCompleted !== undefined
                ? { followUpCompleted: Boolean(d.followUpCompleted) }
                : {}),
              ...(d.status !== undefined ? { status: d.status as ApplicationStatus } : {}),
              updatedAt: now,
            };
            return serializeApplication(updated);
          });

          if (count > 0) {
            await writeDb(db);
          }
          return { count };
        }),

      deleteMany: async (args: { where?: WhereClause }) =>
        withLock(async () => {
          const db = await readDb();
          const before = db.applications.length;
          db.applications = db.applications.filter(
            (a) => !matchesWhere(hydrateApplication(a), args.where)
          );
          const count = before - db.applications.length;
          if (count > 0) {
            await writeDb(db);
          }
          return { count };
        }),
    },

    resume: {
      findMany: async (args?: {
        where?: WhereClause;
        orderBy?: OrderByClause;
        select?: SelectClause;
      }) =>
        withLock(async () => {
          const db = await readDb();
          let rows = db.resumes
            .map(hydrateResume)
            .filter((r) => matchesWhere(r, args?.where));
          rows = sortRows(rows, args?.orderBy);
          return rows.map((r) => applySelect(r, args?.select));
        }),

      findFirst: async (args?: {
        where?: WhereClause;
        select?: SelectClause;
      }) =>
        withLock(async () => {
          const db = await readDb();
          const found = db.resumes
            .map(hydrateResume)
            .find((r) => matchesWhere(r, args?.where));
          if (!found) return null;
          return applySelect(found, args?.select);
        }),

      create: async (args: {
        data: { fileName: string; filePath: string; userId: number };
        select?: SelectClause;
      }) =>
        withLock(async () => {
          const db = await readDb();
          const resume: LocalResume = {
            id: db.nextIds.resume++,
            fileName: args.data.fileName,
            filePath: args.data.filePath,
            createdAt: new Date(),
            userId: args.data.userId,
          };
          db.resumes.push(serializeResume(resume));
          await writeDb(db);
          return applySelect(resume, args.select);
        }),

      delete: async (args: { where: { id: number } }) =>
        withLock(async () => {
          const db = await readDb();
          const idx = db.resumes.findIndex((r) => r.id === args.where.id);
          if (idx === -1) {
            throw new Error("Resume not found.");
          }
          const [removed] = db.resumes.splice(idx, 1);
          await writeDb(db);
          return hydrateResume(removed);
        }),
    },
  };
}
