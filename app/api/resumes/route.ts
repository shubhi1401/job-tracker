
import { NextResponse } from "next/server";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const resumes = await prisma.resume.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    select: { id: true, fileName: true, createdAt: true },
  });

  return NextResponse.json(resumes);
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Choose a PDF file." }, { status: 400 });
    }

    if (file.type !== "application/pdf" || !file.name.toLowerCase().endsWith(".pdf")) {
      return NextResponse.json({ error: "Only PDF files are allowed." }, { status: 400 });
    }

    if (file.size === 0 || file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "PDF must be between 1 byte and 5 MB." },
        { status: 400 }
      );
    }

    const bytes = Buffer.from(await file.arrayBuffer());

    // Check the PDF signature rather than trusting only the filename/MIME type.
    if (bytes.subarray(0, 5).toString() !== "%PDF-") {
      return NextResponse.json({ error: "Invalid PDF file." }, { status: 400 });
    }

    const directory = path.join(process.cwd(), "private-resumes");
    await mkdir(directory, { recursive: true });

    const storedName = `${randomUUID()}.pdf`;
    const filePath = path.join(directory, storedName);

    await writeFile(filePath, bytes, { flag: "wx" });

    try {
      const resume = await prisma.resume.create({
        data: {
          fileName: path.basename(file.name),
          filePath: storedName,
          userId: user.id,
        },
        select: { id: true, fileName: true, createdAt: true },
      });

      return NextResponse.json(resume, { status: 201 });
    } catch (error) {
      const { unlink } = await import("node:fs/promises");
      await unlink(filePath).catch(() => {});
      throw error;
    }
  } catch (error) {
    console.error("RESUME UPLOAD ERROR:", error);
    return NextResponse.json({ error: "Could not upload resume." }, { status: 500 });
  }
}
