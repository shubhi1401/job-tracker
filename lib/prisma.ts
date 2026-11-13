import { PrismaClient } from "@/lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { createLocalPrismaClient } from "@/lib/local-db";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  localPrisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
  });

  return new PrismaClient({
    adapter,
  });
}

const useLocalDb = process.env.USE_LOCAL_DB === "true";

const prisma = useLocalDb
  ? (globalForPrisma.localPrisma ??
    (createLocalPrismaClient() as unknown as PrismaClient))
  : (globalForPrisma.prisma ?? createPrismaClient());

if (useLocalDb) {
  globalForPrisma.localPrisma = prisma;
} else {
  // Always cache client on globalThis to avoid multiple connections across serverless warm invocations
  globalForPrisma.prisma = prisma;
}

export default prisma;
