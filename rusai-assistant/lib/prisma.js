import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const globalForPrisma = global

const prisma = globalForPrisma.prisma || (() => {
  const adapter = new PrismaPg(process.env.DATABASE_URL)
  return new PrismaClient({ adapter })
})()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma
