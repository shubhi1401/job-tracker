
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    const applications = await prisma.application.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(applications);
  } catch (error) {
    console.error("GET APPLICATIONS ERROR:", error);

    return NextResponse.json(
      { error: "Failed to fetch applications." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    const body = await request.json();

    if (
      !body.company?.trim() ||
      !body.role?.trim() ||
      !body.location?.trim() ||
      !body.applicationDate
    ) {
      return NextResponse.json(
        {
          error: "Company, role, location and application date are required.",
        },
        { status: 400 }
      );
    }

    const allowedStatuses = [
      "APPLIED",
      "INTERVIEW",
      "OFFER",
      "REJECTED",
    ];

    if (!allowedStatuses.includes(body.status)) {
      return NextResponse.json(
        { error: "Invalid application status." },
        { status: 400 }
      );
    }

    const applicationDate = new Date(body.applicationDate);
    const followUpDate = body.followUpDate
      ? new Date(body.followUpDate)
      : null;

    if (Number.isNaN(applicationDate.getTime())) {
      return NextResponse.json(
        { error: "Invalid application date." },
        { status: 400 }
      );
    }

    if (followUpDate && Number.isNaN(followUpDate.getTime())) {
      return NextResponse.json(
        { error: "Invalid follow-up date." },
        { status: 400 }
      );
    }

    if (
      followUpDate &&
      followUpDate.toISOString().slice(0, 10) <
        applicationDate.toISOString().slice(0, 10)
    ) {
      return NextResponse.json(
        { error: "Follow-up date cannot be before the application date." },
        { status: 400 }
      );
    }
    const interviewDate = body.interviewDate
  ? new Date(body.interviewDate)
  : null;

if (interviewDate && Number.isNaN(interviewDate.getTime())) {
  return NextResponse.json(
    { error: "Invalid interview date." },
    { status: 400 }
  );
}
    const application = await prisma.application.create({
      data: {
        company: body.company.trim(),
        role: body.role.trim(),
        location: body.location.trim(),
        jobUrl: body.jobUrl || null,
        salary: body.salary || null,
        status: body.status,
        recruiterName: body.recruiterName || null,
        recruiterEmail: body.recruiterEmail || null,
        applicationDate,
        interviewDate,
        followUpDate,
        notes: body.notes || null,
        userId: user.id,
      },
    });

    return NextResponse.json(application, { status: 201 });
  } catch (error) {
    console.error("CREATE APPLICATION ERROR:", error);

    return NextResponse.json(
      { error: "Failed to create application." },
      { status: 500 }
    );
  }
}
