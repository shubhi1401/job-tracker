import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

export type ReferralStatus =
  | "REACHED_OUT"
  | "CALL_SCHEDULED"
  | "REFERRED"
  | "INTERVIEWING"
  | "NO_RESPONSE"
  | "DECLINED";

export type Referral = {
  id: string;
  userId: number;
  name: string;
  company: string;
  role: string;
  relationship: string;
  email?: string;
  linkedinUrl?: string;
  status: ReferralStatus;
  applicationId?: number | null;
  applicationName?: string | null;
  followUpDate?: string | null;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateReferralInput = {
  name: string;
  company: string;
  role: string;
  relationship?: string;
  email?: string;
  linkedinUrl?: string;
  status?: ReferralStatus;
  applicationId?: number | null;
  applicationName?: string | null;
  followUpDate?: string | null;
  notes?: string;
};

export type UpdateReferralInput = Partial<CreateReferralInput>;

const DATA_DIR = path.join(process.cwd(), "data", "referrals");

async function ensureDirectory(): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
}

function getUserFilePath(userId: number): string {
  return path.join(DATA_DIR, `${userId}.json`);
}

export async function getReferrals(userId: number): Promise<Referral[]> {
  try {
    await ensureDirectory();
    const filePath = getUserFilePath(userId);
    const content = await readFile(filePath, "utf-8");
    const data = JSON.parse(content);
    if (Array.isArray(data)) {
      return data.sort(
        (a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime()
      );
    }
    return [];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return [];
    }
    console.error("Error reading referrals:", error);
    return [];
  }
}

export async function createReferral(
  userId: number,
  input: CreateReferralInput
): Promise<Referral> {
  await ensureDirectory();
  const referrals = await getReferrals(userId);

  const now = new Date().toISOString();
  const newReferral: Referral = {
    id: randomUUID(),
    userId,
    name: input.name.trim(),
    company: input.company.trim(),
    role: input.role.trim(),
    relationship: input.relationship?.trim() || "Cold Outreach",
    email: input.email?.trim() || undefined,
    linkedinUrl: input.linkedinUrl?.trim() || undefined,
    status: input.status || "REACHED_OUT",
    applicationId: input.applicationId || null,
    applicationName: input.applicationName || null,
    followUpDate: input.followUpDate || null,
    notes: input.notes?.trim() || "",
    createdAt: now,
    updatedAt: now,
  };

  referrals.unshift(newReferral);
  await writeFile(getUserFilePath(userId), JSON.stringify(referrals, null, 2), "utf-8");
  return newReferral;
}

export async function updateReferral(
  userId: number,
  id: string,
  input: UpdateReferralInput
): Promise<Referral | null> {
  await ensureDirectory();
  const referrals = await getReferrals(userId);
  const index = referrals.findIndex((r) => r.id === id);

  if (index === -1) {
    return null;
  }

  const existing = referrals[index];
  const updated: Referral = {
    ...existing,
    ...(input.name !== undefined ? { name: input.name.trim() } : {}),
    ...(input.company !== undefined ? { company: input.company.trim() } : {}),
    ...(input.role !== undefined ? { role: input.role.trim() } : {}),
    ...(input.relationship !== undefined ? { relationship: input.relationship.trim() } : {}),
    ...(input.email !== undefined ? { email: input.email.trim() } : {}),
    ...(input.linkedinUrl !== undefined ? { linkedinUrl: input.linkedinUrl.trim() } : {}),
    ...(input.status !== undefined ? { status: input.status } : {}),
    ...(input.applicationId !== undefined ? { applicationId: input.applicationId } : {}),
    ...(input.applicationName !== undefined ? { applicationName: input.applicationName } : {}),
    ...(input.followUpDate !== undefined ? { followUpDate: input.followUpDate } : {}),
    ...(input.notes !== undefined ? { notes: input.notes.trim() } : {}),
    updatedAt: new Date().toISOString(),
  };

  referrals[index] = updated;
  await writeFile(getUserFilePath(userId), JSON.stringify(referrals, null, 2), "utf-8");
  return updated;
}

export async function deleteReferral(userId: number, id: string): Promise<boolean> {
  await ensureDirectory();
  const referrals = await getReferrals(userId);
  const filtered = referrals.filter((r) => r.id !== id);

  if (filtered.length === referrals.length) {
    return false;
  }

  await writeFile(getUserFilePath(userId), JSON.stringify(filtered, null, 2), "utf-8");
  return true;
}
