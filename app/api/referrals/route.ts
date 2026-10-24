import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getReferrals, createReferral, ReferralStatus } from "@/lib/referrals-storage";

export const runtime = "nodejs";

const VALID_STATUSES: ReferralStatus[] = [
  "REACHED_OUT",
  "CALL_SCHEDULED",
  "REFERRED",
  "INTERVIEWING",
  "NO_RESPONSE",
  "DECLINED",
];

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const referrals = await getReferrals(user.id);
  return NextResponse.json(referrals);
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      company,
      role,
      relationship,
      email,
      linkedinUrl,
      status,
      applicationId,
      applicationName,
      followUpDate,
      notes,
    } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ error: "Contact name is required." }, { status: 400 });
    }

    if (!company || typeof company !== "string" || !company.trim()) {
      return NextResponse.json({ error: "Company name is required." }, { status: 400 });
    }

    if (!role || typeof role !== "string" || !role.trim()) {
      return NextResponse.json({ error: "Contact role or title is required." }, { status: 400 });
    }

    const validatedStatus: ReferralStatus =
      status && VALID_STATUSES.includes(status) ? status : "REACHED_OUT";

    const created = await createReferral(user.id, {
      name,
      company,
      role,
      relationship,
      email,
      linkedinUrl,
      status: validatedStatus,
      applicationId: typeof applicationId === "number" ? applicationId : null,
      applicationName: typeof applicationName === "string" ? applicationName : null,
      followUpDate: followUpDate || null,
      notes,
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("REFERRAL POST ERROR:", error);
    return NextResponse.json(
      { error: "Failed to create referral contact." },
      { status: 500 }
    );
  }
}
