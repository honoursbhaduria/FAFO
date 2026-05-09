// ============================================================
// Question Engine — Resolves which questions to show this session
// ============================================================

import type { SchemaMap, QuestionDef, ActiveQuestion, QuestionConfig } from "@/types/questionnaire";
import questionBank from "@/data/question-bank.json";

/**
 * Given a SchemaMap from the inspector, resolve which questions
 * from the question bank should be active for this session.
 */
export function resolveQuestions(schema: SchemaMap): QuestionConfig {
  const allQuestions = questionBank as QuestionDef[];
  const flatCols = new Set(schema.flatColumnNames.map((c) => c.toLowerCase()));
  const active: ActiveQuestion[] = [];

  for (const q of allQuestions) {
    const trigger = q.dbTrigger;

    if (trigger.type === "always") {
      active.push({ ...q, isConditional: false });
      continue;
    }

    if (trigger.type === "column_exists") {
      const col = (trigger.column || "").toLowerCase();
      // Check both exact match and camelCase→snake conversion
      const snaked = col.replace(/([A-Z])/g, "_$1").toLowerCase();
      if (flatCols.has(col) || flatCols.has(snaked)) {
        active.push({ ...q, isConditional: false });
      }
      continue;
    }

    if (trigger.type === "sector_branch") {
      // Always include but mark as conditional — UI shows/hides based on sector answer
      active.push({
        ...q,
        isConditional: true,
        conditionSector: trigger.sector,
      });
      continue;
    }
  }

  // Sort by displayOrder
  active.sort((a, b) => a.displayOrder - b.displayOrder);

  const totalBase = active.filter((q) => !q.isConditional).length;

  return {
    questions: active,
    totalBaseQuestions: totalBase,
    schemaInspectedAt: schema.inspectedAt,
  };
}

/**
 * Filter the active questions based on the user's current answers.
 * Sector branch questions are only visible when the matching sector is selected.
 */
export function getVisibleQuestions(
  config: QuestionConfig,
  answers: Record<string, string | string[] | number>
): ActiveQuestion[] {
  const selectedSector = answers["sector"] as string | undefined;

  return config.questions.filter((q) => {
    if (!q.isConditional) return true;
    if (q.conditionSector && selectedSector === q.conditionSector) return true;
    return false;
  });
}
