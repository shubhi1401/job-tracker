
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const applications = await prisma.application.findMany({
      where: {
        userId: user.id,
        OR: [
          { interviewDate: { not: null } },
          { followUpDate: { not: null } },
        ],
      },
      select: {
        id: true,
        company: true,
        role: true,
        status: true,
        applicationDate: true,
        interviewDate: true,
        followUpDate: true,
        followUpCompleted: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(applications);
  } catch (error) {
    console.error("GET REMINDERS ERROR:", error);

    return NextResponse.json(
      { error: "Could not load reminders." },
      { status: 500 }
    );
  }
}
