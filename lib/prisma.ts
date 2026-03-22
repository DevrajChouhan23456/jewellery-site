import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";

const globalForPrisma = global as unknown as {
  prisma?: PrismaClient;
};

function createPrismaClient() {
  const accelerateUrl = process.env.DATABASE_URL;

  if (!accelerateUrl) {
    throw new Error("DATABASE_URL is not configured.");
  }

  return new PrismaClient({
    accelerateUrl,
  }).$extends(withAccelerate());
}

const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma as PrismaClient;
}

export default prisma;
