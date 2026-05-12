const { PrismaClient } = require("./web/src/generated/client");
const prisma = new PrismaClient();

async function main() {
  const result = await prisma.$queryRawUnsafe(`
    SELECT scheme_name, raw_data->'fields'->'beneficiaryState' as states 
    FROM schemes 
    WHERE (raw_data->'fields'->>'beneficiaryState') ILIKE '%Andhra Pradesh%'
    LIMIT 5
  `);
  console.log(JSON.stringify(result, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
