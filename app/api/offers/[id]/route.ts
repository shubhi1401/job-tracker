import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { updateOffer, deleteOffer } from "@/lib/offers-storage";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

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
      return NextResponse.json({ error: "Missing offer ID." }, { status: 400 });
    }

    const body = await request.json();
    const updated = await updateOffer(user.id, id, body);

    if (!updated) {
      return NextResponse.json({ error: "Offer not found." }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("OFFER PATCH ERROR:", error);
    return NextResponse.json(
      { error: "Failed to update offer." },
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
      return NextResponse.json({ error: "Missing offer ID." }, { status: 400 });
    }

    const deleted = await deleteOffer(user.id, id);
    if (!deleted) {
      return NextResponse.json({ error: "Offer not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error("OFFER DELETE ERROR:", error);
    return NextResponse.json(
      { error: "Failed to delete offer." },
      { status: 500 }
    );
  }
}
