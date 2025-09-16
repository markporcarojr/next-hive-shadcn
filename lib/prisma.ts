// lib/prisma.ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

function createPrismaClient() {
  return new PrismaClient().$extends({
    result: {
      expense: {
        amount: {
          needs: { amount: true },
          compute(expense) {
            return expense.amount.toNumber(); // Always return number
          },
        },
        date: {
          needs: { date: true },
          compute(expense) {
            return expense.date; // Keep as Date (you format in UI)
          },
        },
        createdAt: {
          needs: { createdAt: true },
          compute(expense) {
            return expense.createdAt; // Optional: return as Date
          },
        },
        updatedAt: {
          needs: { updatedAt: true },
          compute(expense) {
            return expense.updatedAt; // Optional: return as Date
          },
        },
      },
    },
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
