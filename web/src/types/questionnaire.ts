// ============================================================
// Dynamic Questionnaire System — TypeScript Interfaces
// ============================================================

// ── Schema Inspector Types ────────────────────────────────

export interface ColumnInfo {
  table_name: string;
  column_name: string;
  data_type: string;
  is_nullable: boolean;
  unique_values?: string[];
}

export interface JsonKeyInfo {
  table_name: string;
  column_name: string;
  keys: string[];
}

export interface SchemaMap {
  tables: string[];
  columns: ColumnInfo[];
  flatColumnNames: string[];
  filterColumns: ColumnInfo[];
  jsonKeys: JsonKeyInfo[];
  inspectedAt: string;
}

// ── Question Bank Types ───────────────────────────────────

export type QuestionInputType =
  | "single_select"
  | "multi_select"
  | "text"
  | "number"
  | "dropdown";

export type TriggerType = "always" | "column_exists" | "sector_branch";

export interface DbTrigger {
  type: TriggerType;
  column?: string;       // for column_exists — the column name to check
  sector?: string;       // for sector_branch — which sector value activates this
}

export interface QuestionOption {
  label: string;
  value: string;
  description?: string;
  icon?: string;
}

export interface QuestionDef {
  id: string;
  dbTrigger: DbTrigger;
  questionText: string;
  subtitle?: string;
  inputType: QuestionInputType;
  options?: QuestionOption[];
  dbFilterColumn?: string;
  dbFilterTable?: string;
  dbFilterJsonPath?: string; // e.g. "raw_data->fields->>beneficiaryState"
  required: boolean;
  displayOrder: number;
  category: string;
}

// ── Question Engine Types ─────────────────────────────────

/** A question that has been resolved as active for this session */
export interface ActiveQuestion extends QuestionDef {
  isConditional: boolean;        // true for sector_branch questions
  conditionSector?: string;      // the sector value that activates it
}

export interface QuestionConfig {
  questions: ActiveQuestion[];
  totalBaseQuestions: number;     // count before sector branching
  schemaInspectedAt: string;
}

// ── User Answers ──────────────────────────────────────────

export type UserAnswers = Record<string, string | string[] | number>;

// ── Recommendation Engine Types ───────────────────────────

export interface SchemeResult {
  api_id: string;
  scheme_name: string;
  description: string;
  categories: string[];
  matchReasons: string[];
  benefits?: string;
  howToApply?: string;
  documents?: string[];
  ministry?: string;
  slug?: string;
  relevanceScore: number;
}

export interface RecommendationResponse {
  schemes: SchemeResult[];
  totalMatched: number;
  filtersApplied: string[];
  queryTime: number;
}
