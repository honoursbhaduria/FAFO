const { PrismaClient } = require("./web/src/generated/client");
const prisma = new PrismaClient();

async function main() {
  const schemes = await prisma.schemes.findMany({
    take: 10,
    select: {
      scheme_name: true,
      raw_data: true,
      categories: true
    }
  });
  console.log(JSON.stringify(schemes, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
