const { PrismaClient } = require("./web/src/generated/client");
const prisma = new PrismaClient();

async function main() {
  const counts = await Promise.all([
    prisma.schemes.count(),
    prisma.user.count(),
    prisma.api_responses.count(),
  ]);
  console.log("Counts:", {
    schemes: counts[0],
    users: counts[1],
    api_responses: counts[2]
  });
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
