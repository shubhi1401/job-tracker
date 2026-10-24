import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getOffers, createOffer } from "@/lib/offers-storage";

export const runtime = "nodejs";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const offers = await getOffers(user.id);
  return NextResponse.json(offers);
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      company,
      role,
      location,
      workModel,
      baseSalary,
      bonusPercent,
      stockPerYear,
      signOnBonus,
      match401kPercent,
      deadlineDate,
      status,
      applicationId,
      applicationName,
      notes,
    } = body;

    if (!company || typeof company !== "string" || !company.trim()) {
      return NextResponse.json({ error: "Company name is required." }, { status: 400 });
    }

    if (!role || typeof role !== "string" || !role.trim()) {
      return NextResponse.json({ error: "Role title is required." }, { status: 400 });
    }

    if (!location || typeof location !== "string" || !location.trim()) {
      return NextResponse.json({ error: "Location is required." }, { status: 400 });
    }

    const parsedBase = Number(baseSalary);
    if (isNaN(parsedBase) || parsedBase <= 0) {
      return NextResponse.json(
        { error: "Base salary must be a positive number." },
        { status: 400 }
      );
    }

    const created = await createOffer(user.id, {
      company,
      role,
      location,
      workModel,
      baseSalary: parsedBase,
      bonusPercent: Number(bonusPercent) || 0,
      stockPerYear: Number(stockPerYear) || 0,
      signOnBonus: Number(signOnBonus) || 0,
      match401kPercent: Number(match401kPercent) || 0,
      deadlineDate,
      status,
      applicationId: typeof applicationId === "number" ? applicationId : null,
      applicationName: typeof applicationName === "string" ? applicationName : null,
      notes,
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("OFFER POST ERROR:", error);
    return NextResponse.json(
      { error: "Failed to create offer record." },
      { status: 500 }
    );
  }
}
