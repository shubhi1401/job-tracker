
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { randomBytes, createHash } from "node:crypto";

const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = body.email?.trim().toLowerCase();
    const password = body.password;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    const passwordMatches = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatches) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    // Generate a random token for this login session.
    const token = randomBytes(32).toString("hex");

    // Store only the token's hash in the database.
    const hashedToken = createHash("sha256")
      .update(token)
      .digest("hex");

    const expiresAt = new Date(Date.now() + SESSION_DURATION);

    await prisma.session.create({
      data: {
        token: hashedToken,
        userId: user.id,
        expiresAt,
      },
    });

    const response = NextResponse.json(
      {
        message: "Login successful.",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      },
      { status: 200 }
    );

    response.cookies.set("sessionToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      expires: expiresAt,
    });

    return response;
  } catch (error) {
    console.error("LOGIN ERROR:", error);

    return NextResponse.json(
      { error: "Failed to login." },
      { status: 500 }
    );
  }
}
