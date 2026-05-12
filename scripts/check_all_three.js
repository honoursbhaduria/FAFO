const { PrismaClient } = require("./web/src/generated/client");
const prisma = new PrismaClient();

async function main() {
  const result = await prisma.$queryRawUnsafe(`
    SELECT scheme_name
    FROM schemes 
    WHERE (raw_data->'fields'->>'beneficiaryState' ILIKE '%Andhra Pradesh%' OR raw_data->'fields'->>'beneficiaryState' ILIKE '%All%')
    AND (scheme_name ILIKE '%Agriculture%' OR categories::text ILIKE '%Agriculture%')
    AND (scheme_name ILIKE '%Women%' OR raw_data->'fields'->>'briefDescription' ILIKE '%Women%' OR categories::text ILIKE '%Women%')
    LIMIT 5
  `);
  console.log("Matches for all 3:", result.length);
  console.log(JSON.stringify(result, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
