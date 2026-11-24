const { PrismaClient } = require('@prisma/client');

// Prevent multiple PrismaClient instances in serverless hot reloads
const globalForPrisma = global;

if (!globalForPrisma.prisma) {
  globalForPrisma.prisma = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });
}

module.exports = globalForPrisma.prisma;
