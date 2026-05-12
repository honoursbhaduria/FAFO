
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  try {
    const user = await prisma.user.findFirst({
      select: {
        id: true,
        profileImage: true
      }
    });
    console.log("Success! Found profileImage field.");
  } catch (err) {
    console.error("Prisma Client Error:", err.message);
  } finally {
    await prisma.$disconnect();
  }
}

test();
