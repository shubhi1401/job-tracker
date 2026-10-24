import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(
  _request: Request,
  { params }: RouteContext
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { id } = await params;
    const applicationId = Number(id);

    if (!Number.isInteger(applicationId) || applicationId <= 0) {
      return NextResponse.json(
        { error: "Invalid application ID." },
        { status: 400 }
      );
    }

    const application = await prisma.application.findFirst({
      where: { id: applicationId, userId: user.id },
    });

    if (!application) {
      return NextResponse.json(
        { error: "Application not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(application);
  } catch (error) {
    console.error("GET APPLICATION ERROR:", error);

    return NextResponse.json(
      { error: "Failed to fetch application." },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: RouteContext
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { id } = await params;
    const applicationId = Number(id);

    if (!Number.isInteger(applicationId) || applicationId <= 0) {
      return NextResponse.json(
        { error: "Invalid application ID." },
        { status: 400 }
      );
    }

    const body = await request.json();

    const existing = await prisma.application.findFirst({
      where: { id: applicationId, userId: user.id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Application not found." },
        { status: 404 }
      );
    }

    const data: Record<string, unknown> = {};

    if (body.company !== undefined) data.company = body.company;
    if (body.role !== undefined) data.role = body.role;
    if (body.location !== undefined) data.location = body.location;
    if (body.jobUrl !== undefined) data.jobUrl = body.jobUrl || null;
    if (body.salary !== undefined) data.salary = body.salary || null;
    if (body.recruiterName !== undefined) {
      data.recruiterName = body.recruiterName || null;
    }
    if (body.recruiterEmail !== undefined) {
      data.recruiterEmail = body.recruiterEmail || null;
    }
    if (body.notes !== undefined) data.notes = body.notes || null;

    if (body.status !== undefined) {
      const allowedStatuses = ["APPLIED", "INTERVIEW", "OFFER", "REJECTED"];

      if (!allowedStatuses.includes(body.status)) {
        return NextResponse.json(
          { error: "Invalid application status." },
          { status: 400 }
        );
      }

      data.status = body.status;
    }

    if (body.applicationDate !== undefined) {
      const date = new Date(body.applicationDate);

      if (Number.isNaN(date.getTime())) {
        return NextResponse.json(
          { error: "Invalid application date." },
          { status: 400 }
        );
      }

      data.applicationDate = date;
    }

    if (body.interviewDate !== undefined) {
      if (!body.interviewDate) {
        data.interviewDate = null;
      } else {
        const date = new Date(body.interviewDate);

        if (Number.isNaN(date.getTime())) {
          return NextResponse.json(
            { error: "Invalid interview date." },
            { status: 400 }
          );
        }

        data.interviewDate = date;
      }
    }

    if (body.followUpDate !== undefined) {
      if (!body.followUpDate) {
        data.followUpDate = null;
      } else {
        const date = new Date(body.followUpDate);

        if (Number.isNaN(date.getTime())) {
          return NextResponse.json(
            { error: "Invalid follow-up date." },
            { status: 400 }
          );
        }

        data.followUpDate = date;
      }
    }

    if (body.followUpCompleted !== undefined) {
      if (typeof body.followUpCompleted !== "boolean") {
        return NextResponse.json(
          { error: "followUpCompleted must be true or false." },
          { status: 400 }
        );
      }

      data.followUpCompleted = body.followUpCompleted;
    }

    const application = await prisma.application.update({
      where: { id: applicationId },
      data: data as never,
    });

    return NextResponse.json(application);
  } catch (error) {
    console.error("UPDATE APPLICATION ERROR:", error);

    return NextResponse.json(
      { error: "Failed to update application." },
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
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { id } = await params;
    const applicationId = Number(id);

    if (!Number.isInteger(applicationId) || applicationId <= 0) {
      return NextResponse.json(
        { error: "Invalid application ID." },
        { status: 400 }
      );
    }

    const result = await prisma.application.deleteMany({
      where: { id: applicationId, userId: user.id },
    });

    if (result.count === 0) {
      return NextResponse.json(
        { error: "Application not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Application deleted successfully.",
    });
  } catch (error) {
    console.error("DELETE APPLICATION ERROR:", error);

    return NextResponse.json(
      { error: "Failed to delete application." },
      { status: 500 }
    );
  }
}
