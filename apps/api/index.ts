import { PrismaClient } from 'database'

(async () => {
  const prisma = new PrismaClient()

  const users = await prisma.user.findMany()

  console.log(users)

  prisma.$disconnect()
})()