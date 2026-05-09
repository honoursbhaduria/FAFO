// ============================================================
// Schema Inspector — Runs ONCE on app init, inspects all DB tables
// ============================================================

import { prisma } from "@/lib/prisma";
import type { SchemaMap, ColumnInfo, JsonKeyInfo } from "@/types/questionnaire";

const FILTER_KEYWORDS = [
  "state", "gender", "caste", "category", "status", "type", "sector",
  "beneficiary", "eligibility", "tags", "region", "religion", "disability",
  "occupation", "age", "income", "education", "marital", "industry",
  "entity", "women", "startup", "turnover",
];

/** Global in-memory cache — survives for the entire server process */
let cachedSchema: SchemaMap | null = null;

export async function getSchemaMap(forceRefresh = false): Promise<SchemaMap> {
  if (cachedSchema && !forceRefresh) return cachedSchema;

  // 1. Get all tables
  const tables: { table_name: string }[] = await prisma.$queryRawUnsafe(`
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    ORDER BY table_name
  `);

  const tableNames = tables.map((t) => t.table_name);

  // 2. Get all columns
  const rawCols: {
    table_name: string;
    column_name: string;
    data_type: string;
    is_nullable: string;
  }[] = await prisma.$queryRawUnsafe(`
    SELECT table_name, column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_schema = 'public'
    ORDER BY table_name, ordinal_position
  `);

  const columns: ColumnInfo[] = rawCols.map((c) => ({
    table_name: c.table_name,
    column_name: c.column_name,
    data_type: c.data_type,
    is_nullable: c.is_nullable === "YES",
  }));

  // 3. Identify filter columns and fetch unique values
  const filterColumns: ColumnInfo[] = [];

  for (const col of columns) {
    const isFilter = FILTER_KEYWORDS.some((kw) =>
      col.column_name.toLowerCase().includes(kw)
    );
    if (!isFilter) continue;

    if (col.data_type === "jsonb" || col.data_type === "json") continue;

    try {
      const vals: { val: string }[] = await prisma.$queryRawUnsafe(
        `SELECT DISTINCT "${col.column_name}"::text AS val
         FROM "${col.table_name}"
         WHERE "${col.column_name}" IS NOT NULL
         LIMIT 50`
      );
      col.unique_values = vals.map((v) => v.val).filter(Boolean);
    } catch {
      col.unique_values = [];
    }
    filterColumns.push(col);
  }

  // 4. Sample JSON/JSONB columns for keys
  const jsonCols = columns.filter(
    (c) => c.data_type === "jsonb" || c.data_type === "json"
  );
  const jsonKeys: JsonKeyInfo[] = [];

  for (const jc of jsonCols) {
    try {
      const rows: { keys: string[] }[] = await prisma.$queryRawUnsafe(
        `SELECT ARRAY(
           SELECT DISTINCT k
           FROM (
             SELECT jsonb_object_keys("${jc.column_name}"::jsonb) AS k
             FROM "${jc.table_name}"
             WHERE "${jc.column_name}" IS NOT NULL
             LIMIT 100
           ) sub
         ) AS keys`
      );
      const topKeys = rows[0]?.keys || [];

      // Also try to get nested keys under "fields" if it exists
      let nestedKeys: string[] = [];
      try {
        const nested: { keys: string[] }[] = await prisma.$queryRawUnsafe(
          `SELECT ARRAY(
             SELECT DISTINCT k
             FROM (
               SELECT jsonb_object_keys(("${jc.column_name}"->'fields')::jsonb) AS k
               FROM "${jc.table_name}"
               WHERE "${jc.column_name}"->'fields' IS NOT NULL
               LIMIT 100
             ) sub
           ) AS keys`
        );
        nestedKeys = nested[0]?.keys || [];
      } catch { /* no nested fields key */ }

      jsonKeys.push({
        table_name: jc.table_name,
        column_name: jc.column_name,
        keys: [...topKeys, ...nestedKeys.map((k) => `fields.${k}`)],
      });
    } catch {
      jsonKeys.push({ table_name: jc.table_name, column_name: jc.column_name, keys: [] });
    }
  }

  const flatColumnNames = columns.map((c) => c.column_name);

  cachedSchema = {
    tables: tableNames,
    columns,
    flatColumnNames,
    filterColumns,
    jsonKeys,
    inspectedAt: new Date().toISOString(),
  };

  return cachedSchema;
}
