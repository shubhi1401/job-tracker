
import { cookies } from "next/headers";
import { createHash } from "node:crypto";
import prisma from "@/lib/prisma";

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("sessionToken")?.value;

  if (!token) {
    return null;
  }

  const hashedToken = createHash("sha256")
    .update(token)
    .digest("hex");

  const session = await prisma.session.findUnique({
    where: { token: hashedToken },
    include: { user: true },
  });

  if (!session) {
    return null;
  }

  if (session.expiresAt <= new Date()) {
    await prisma.session.delete({
      where: { id: session.id },
    });
    return null;
  }

  return {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
  };
}
