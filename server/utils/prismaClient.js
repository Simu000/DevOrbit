import { PrismaClient } from "@prisma/client";

let prisma;

export function prismaClient() {
  if (!prisma) {
    prisma = new PrismaClient();
  }
  return prisma;
}
