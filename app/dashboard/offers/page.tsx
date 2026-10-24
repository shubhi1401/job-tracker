import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getOffers } from "@/lib/offers-storage";
import OffersClient from "./OffersClient";

export const metadata: Metadata = {
  title: "Offers & Compensation | JobTracker AI",
  description: "Evaluate job offers, compare total compensation packages, and generate AI counteroffers.",
};

export default async function OffersPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const [offers, applications] = await Promise.all([
    getOffers(user.id),
    prisma.application.findMany({
      where: { userId: user.id },
      select: {
        id: true,
        company: true,
        role: true,
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <OffersClient
      initialOffers={offers}
      applications={applications}
    />
  );
}
