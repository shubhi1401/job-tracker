import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { updateReferral, deleteReferral, ReferralStatus } from "@/lib/referrals-storage";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

const VALID_STATUSES: ReferralStatus[] = [
  "REACHED_OUT",
  "CALL_SCHEDULED",
  "REFERRED",
  "INTERVIEWING",
  "NO_RESPONSE",
  "DECLINED",
];

export async function PATCH(
  request: Request,
  { params }: RouteContext
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Missing referral ID." }, { status: 400 });
    }

    const body = await request.json();

    if (body.status && !VALID_STATUSES.includes(body.status)) {
      return NextResponse.json({ error: "Invalid status." }, { status: 400 });
    }

    const updated = await updateReferral(user.id, id, body);
    if (!updated) {
      return NextResponse.json({ error: "Referral contact not found." }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("REFERRAL PATCH ERROR:", error);
    return NextResponse.json(
      { error: "Failed to update referral contact." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: RouteContext
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Missing referral ID." }, { status: 400 });
    }

    const deleted = await deleteReferral(user.id, id);
    if (!deleted) {
      return NextResponse.json({ error: "Referral contact not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error("REFERRAL DELETE ERROR:", error);
    return NextResponse.json(
      { error: "Failed to delete referral contact." },
      { status: 500 }
    );
  }
}
