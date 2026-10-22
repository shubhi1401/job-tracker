
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    const now = new Date();

    const interviews = await prisma.application.findMany({
      where: {
        userId: user.id,
        interviewDate: {
          gte: now,
        },
      },
      select: {
        id: true,
        company: true,
        role: true,
        interviewDate: true,
        status: true,
      },
      orderBy: {
        interviewDate: "asc",
      },
      take: 5,
    });

    return NextResponse.json(interviews);
  } catch (error) {
    console.error("GET UPCOMING INTERVIEWS ERROR:", error);

    return NextResponse.json(
      { error: "Failed to fetch upcoming interviews." },
      { status: 500 }
    );
  }
}
