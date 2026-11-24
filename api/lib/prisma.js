const { PrismaClient } = require('@prisma/client');

// Reuse client across hot reloads in serverless
const globalForPrisma = globalThis;
const prisma = globalForPrisma.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

module.exports = prisma;
