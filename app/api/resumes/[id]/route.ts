
import { NextResponse } from "next/server";
import { readFile, unlink } from "node:fs/promises";
import path from "node:path";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const resumeId = Number(id);

  if (!Number.isInteger(resumeId) || resumeId <= 0) {
    return NextResponse.json({ error: "Invalid resume ID." }, { status: 400 });
  }

  const resume = await prisma.resume.findFirst({
    where: { id: resumeId, userId: user.id },
  });

  if (!resume) {
    return NextResponse.json({ error: "Resume not found." }, { status: 404 });
  }

  const filePath = path.join(
    process.cwd(),
    "private-resumes",
    path.basename(resume.filePath)
  );

  let bytes: Buffer;

  try {
    bytes = await readFile(filePath);
  } catch (error) {
    console.error("RESUME FILE ERROR:", error);
    return NextResponse.json(
      { error: "Resume file is missing." },
      { status: 404 }
    );
  }

  const shouldDownload =
    new URL(request.url).searchParams.get("download") === "true";

  return new Response(new Uint8Array(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": shouldDownload
        ? `attachment; filename="resume-${resume.id}.pdf"`
        : `inline; filename="resume-${resume.id}.pdf"`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const resumeId = Number(id);

    if (!Number.isInteger(resumeId) || resumeId <= 0) {
      return NextResponse.json({ error: "Invalid resume ID." }, { status: 400 });
    }

    const resume = await prisma.resume.findFirst({
      where: { id: resumeId, userId: user.id },
    });

    if (!resume) {
      return NextResponse.json({ error: "Resume not found." }, { status: 404 });
    }

    await prisma.resume.delete({
      where: { id: resume.id },
    });

    const filePath = path.join(
      process.cwd(),
      "private-resumes",
      path.basename(resume.filePath)
    );

    try {
      await unlink(filePath);
    } catch (error) {
      console.error("Could not remove resume file:", error);
    }

    return NextResponse.json({ message: "Resume deleted successfully." });
  } catch (error) {
    console.error("RESUME DELETE ERROR:", error);

    return NextResponse.json(
      { error: "Could not delete resume." },
      { status: 500 }
    );
  }
}
