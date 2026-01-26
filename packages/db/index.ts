import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config();

export * from "@prisma/client";

const generatePrismaClient = () => {
  return new PrismaClient();
};

const globalForPrisma = globalThis as {
  prisma?: ReturnType<typeof generatePrismaClient>;
};

export const prisma = globalForPrisma.prisma ?? generatePrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
