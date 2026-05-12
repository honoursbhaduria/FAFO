const { PrismaClient } = require("./web/src/generated/client");
const prisma = new PrismaClient();

async function main() {
  const result = await prisma.$queryRawUnsafe(`
    SELECT scheme_name, raw_data->'fields'->'beneficiaryState' as states, categories
    FROM schemes 
    WHERE (scheme_name ILIKE '%Agriculture%' OR categories::text ILIKE '%Agriculture%')
    AND (raw_data->'fields'->>'beneficiaryState' ILIKE '%Andhra Pradesh%' OR raw_data->'fields'->>'beneficiaryState' ILIKE '%All%')
    LIMIT 5
  `);
  console.log(JSON.stringify(result, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
