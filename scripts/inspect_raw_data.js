const { PrismaClient } = require("./web/src/generated/client");
const prisma = new PrismaClient();

async function main() {
  const schemes = await prisma.schemes.findMany({
    where: {
      scheme_name: { contains: "Agriculture", mode: "insensitive" }
    },
    take: 1
  });
  if (schemes.length > 0) {
    console.log(JSON.stringify(schemes[0].raw_data, null, 2));
  } else {
    console.log("No Agriculture schemes found.");
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
