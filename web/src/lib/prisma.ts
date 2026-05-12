import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ["query", "error", "warn"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// Log available models to debug runtime issues
if (typeof window === "undefined") {
  console.log("Prisma initialized. Available models:", Object.keys(prisma).filter(k => !k.startsWith("_")));
}
