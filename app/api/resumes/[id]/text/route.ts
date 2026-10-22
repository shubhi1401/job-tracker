
import { NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { extractText, getDocumentProxy } from "unpdf";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in again." },
        { status: 401 }
      );
    }

    const { id } = await params;
    const resumeId = Number(id);

    if (!Number.isSafeInteger(resumeId) || resumeId <= 0) {
      return NextResponse.json(
        { error: "Invalid resume ID." },
        { status: 400 }
      );
    }

    const resume = await prisma.resume.findFirst({
      where: {
        id: resumeId,
        userId: user.id,
      },
      select: {
        fileName: true,
        filePath: true,
      },
    });

    if (!resume) {
      return NextResponse.json(
        { error: "Resume not found." },
        { status: 404 }
      );
    }

    const filePath = path.join(
      process.cwd(),
      "private-resumes",
      path.basename(resume.filePath)
    );

    const buffer = await readFile(filePath);

    if (
      buffer.length < 5 ||
      buffer.subarray(0, 5).toString("ascii") !== "%PDF-"
    ) {
      return NextResponse.json(
        { error: "The stored file is not a valid PDF." },
        { status: 422 }
      );
    }

    const pdf = await getDocumentProxy(new Uint8Array(buffer));
    const result = await extractText(pdf, { mergePages: true });
    const extractedText = Array.isArray(result.text)
      ? result.text.join("\n")
      : String(result.text ?? "");

    if (!extractedText.trim()) {
      return NextResponse.json(
        {
          error:
            "No selectable text found. This PDF may be scanned and require OCR.",
        },
        { status: 422 }
      );
    }

    return NextResponse.json({
      fileName: resume.fileName,
      text: extractedText.trim(),
    });
  } catch (error) {
    console.error("PDF EXTRACTION FAILURE:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Could not extract PDF text.",
      },
      { status: 500 }
    );
  }
}

