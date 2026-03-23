import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as {
  prisma?: PrismaClient;
};

function createPrismaClient() {
  const mongoUrl = process.env.MONGO_URI;

  if (!mongoUrl) {
    throw new Error("MONGO_URI is not configured.");
  }

  return new PrismaClient({
    datasources: {
      db: {
        url: mongoUrl,
      },
    },
  });
}

const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma as PrismaClient;
}

export default prisma;
