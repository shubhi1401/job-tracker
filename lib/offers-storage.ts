import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

export type WorkModel = "REMOTE" | "HYBRID" | "ONSITE";
export type OfferStatus = "EXPLORING" | "ACCEPTED" | "DECLINED" | "NEGOTIATING";

export type Offer = {
  id: string;
  userId: number;
  company: string;
  role: string;
  location: string;
  workModel: WorkModel;
  baseSalary: number;
  bonusPercent: number; // e.g. 10 for 10%
  stockPerYear: number; // annualized RSU/Equity value
  signOnBonus: number; // one-time 1st year bonus
  match401kPercent: number; // e.g. 4 for 4%
  deadlineDate?: string | null;
  status: OfferStatus;
  applicationId?: number | null;
  applicationName?: string | null;
  notes?: string;
  firstYearTotal: number;
  recurringAnnualTotal: number;
  createdAt: string;
  updatedAt: string;
};

export type CreateOfferInput = {
  company: string;
  role: string;
  location: string;
  workModel?: WorkModel;
  baseSalary: number;
  bonusPercent?: number;
  stockPerYear?: number;
  signOnBonus?: number;
  match401kPercent?: number;
  deadlineDate?: string | null;
  status?: OfferStatus;
  applicationId?: number | null;
  applicationName?: string | null;
  notes?: string;
};

export type UpdateOfferInput = Partial<CreateOfferInput>;

const DATA_DIR = path.join(process.cwd(), "data", "offers");

async function ensureDirectory(): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
}

function getUserFilePath(userId: number): string {
  return path.join(DATA_DIR, `${userId}.json`);
}

export function calculateTotals(
  baseSalary: number,
  bonusPercent: number,
  stockPerYear: number,
  signOnBonus: number
): { firstYearTotal: number; recurringAnnualTotal: number } {
  const bonusAmount = Math.round(baseSalary * ((bonusPercent || 0) / 100));
  const recurringAnnualTotal = baseSalary + bonusAmount + (stockPerYear || 0);
  const firstYearTotal = recurringAnnualTotal + (signOnBonus || 0);

  return { firstYearTotal, recurringAnnualTotal };
}

export async function getOffers(userId: number): Promise<Offer[]> {
  try {
    await ensureDirectory();
    const filePath = getUserFilePath(userId);
    const content = await readFile(filePath, "utf-8");
    const data = JSON.parse(content);
    if (Array.isArray(data)) {
      return data.sort(
        (a, b) => b.firstYearTotal - a.firstYearTotal
      );
    }
    return [];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return [];
    }
    console.error("Error reading offers:", error);
    return [];
  }
}

export async function createOffer(
  userId: number,
  input: CreateOfferInput
): Promise<Offer> {
  await ensureDirectory();
  const offers = await getOffers(userId);

  const base = Number(input.baseSalary) || 0;
  const bonus = Number(input.bonusPercent) || 0;
  const stock = Number(input.stockPerYear) || 0;
  const signOn = Number(input.signOnBonus) || 0;
  const match401k = Number(input.match401kPercent) || 0;

  const { firstYearTotal, recurringAnnualTotal } = calculateTotals(
    base,
    bonus,
    stock,
    signOn
  );

  const now = new Date().toISOString();
  const newOffer: Offer = {
    id: randomUUID(),
    userId,
    company: input.company.trim(),
    role: input.role.trim(),
    location: input.location.trim(),
    workModel: input.workModel || "REMOTE",
    baseSalary: base,
    bonusPercent: bonus,
    stockPerYear: stock,
    signOnBonus: signOn,
    match401kPercent: match401k,
    deadlineDate: input.deadlineDate || null,
    status: input.status || "EXPLORING",
    applicationId: input.applicationId || null,
    applicationName: input.applicationName || null,
    notes: input.notes?.trim() || "",
    firstYearTotal,
    recurringAnnualTotal,
    createdAt: now,
    updatedAt: now,
  };

  offers.push(newOffer);
  await writeFile(getUserFilePath(userId), JSON.stringify(offers, null, 2), "utf-8");
  return newOffer;
}

export async function updateOffer(
  userId: number,
  id: string,
  input: UpdateOfferInput
): Promise<Offer | null> {
  await ensureDirectory();
  const offers = await getOffers(userId);
  const index = offers.findIndex((o) => o.id === id);

  if (index === -1) {
    return null;
  }

  const existing = offers[index];

  const base =
    input.baseSalary !== undefined ? Number(input.baseSalary) || 0 : existing.baseSalary;
  const bonus =
    input.bonusPercent !== undefined
      ? Number(input.bonusPercent) || 0
      : existing.bonusPercent;
  const stock =
    input.stockPerYear !== undefined
      ? Number(input.stockPerYear) || 0
      : existing.stockPerYear;
  const signOn =
    input.signOnBonus !== undefined
      ? Number(input.signOnBonus) || 0
      : existing.signOnBonus;
  const match401k =
    input.match401kPercent !== undefined
      ? Number(input.match401kPercent) || 0
      : existing.match401kPercent;

  const { firstYearTotal, recurringAnnualTotal } = calculateTotals(
    base,
    bonus,
    stock,
    signOn
  );

  const updated: Offer = {
    ...existing,
    ...(input.company !== undefined ? { company: input.company.trim() } : {}),
    ...(input.role !== undefined ? { role: input.role.trim() } : {}),
    ...(input.location !== undefined ? { location: input.location.trim() } : {}),
    ...(input.workModel !== undefined ? { workModel: input.workModel } : {}),
    baseSalary: base,
    bonusPercent: bonus,
    stockPerYear: stock,
    signOnBonus: signOn,
    match401kPercent: match401k,
    ...(input.deadlineDate !== undefined ? { deadlineDate: input.deadlineDate } : {}),
    ...(input.status !== undefined ? { status: input.status } : {}),
    ...(input.applicationId !== undefined ? { applicationId: input.applicationId } : {}),
    ...(input.applicationName !== undefined ? { applicationName: input.applicationName } : {}),
    ...(input.notes !== undefined ? { notes: input.notes.trim() } : {}),
    firstYearTotal,
    recurringAnnualTotal,
    updatedAt: new Date().toISOString(),
  };

  offers[index] = updated;
  await writeFile(getUserFilePath(userId), JSON.stringify(offers, null, 2), "utf-8");
  return updated;
}

export async function deleteOffer(userId: number, id: string): Promise<boolean> {
  await ensureDirectory();
  const offers = await getOffers(userId);
  const filtered = offers.filter((o) => o.id !== id);

  if (filtered.length === offers.length) {
    return false;
  }

  await writeFile(getUserFilePath(userId), JSON.stringify(filtered, null, 2), "utf-8");
  return true;
}
