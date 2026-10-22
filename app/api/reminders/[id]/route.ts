
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const runtime = "nodejs";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const applicationId = Number(id);

    if (!Number.isSafeInteger(applicationId) || applicationId <= 0) {
      return NextResponse.json(
        { error: "Invalid application ID." },
        { status: 400 }
      );
    }

    const body = await request.json();

    if (typeof body.completed !== "boolean") {
      return NextResponse.json(
        { error: "A boolean completed value is required." },
        { status: 400 }
      );
    }

    const updated = await prisma.application.updateMany({
      where: {
        id: applicationId,
        userId: user.id,
      },
      data: {
        followUpCompleted: body.completed,
      },
    });

    if (updated.count === 0) {
      return NextResponse.json(
        { error: "Application not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      completed: body.completed,
    });
  } catch (error) {
    console.error("UPDATE REMINDER ERROR:", error);

    return NextResponse.json(
      { error: "Could not update the follow-up reminder." },
      { status: 500 }
    );
  }
}
