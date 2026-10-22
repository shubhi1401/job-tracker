
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createHash } from "node:crypto";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("sessionToken")?.value;

    if (token) {
      const hashedToken = createHash("sha256")
        .update(token)
        .digest("hex");

      await prisma.session.deleteMany({
        where: { token: hashedToken },
      });
    }

    const response = NextResponse.json({
      message: "Logged out successfully.",
    });

    response.cookies.set("sessionToken", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      expires: new Date(0),
    });

    return response;
  } catch (error) {
    console.error("LOGOUT ERROR:", error);

    return NextResponse.json(
      { error: "Failed to logout." },
      { status: 500 }
    );
  }
}
