import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ["error"], // Changed from "query" to reduce memory bloat from logging large JSONs
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
