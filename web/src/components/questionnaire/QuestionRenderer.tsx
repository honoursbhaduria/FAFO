"use client";

import type { ActiveQuestion } from "@/types/questionnaire";
import SingleSelect from "./question-types/SingleSelect";
import MultiSelect from "./question-types/MultiSelect";
import TextInput from "./question-types/TextInput";
import NumberInput from "./question-types/NumberInput";
import Dropdown from "./question-types/Dropdown";

interface QuestionRendererProps {
  question: ActiveQuestion;
  value: string | string[] | number | undefined;
  onChange: (value: string | string[] | number) => void;
}

export default function QuestionRenderer({ question, value, onChange }: QuestionRendererProps) {
  switch (question.inputType) {
    case "single_select":
      return (
        <SingleSelect
          options={question.options || []}
          value={value as string}
          onChange={(v) => onChange(v)}
        />
      );
    case "multi_select":
      return (
        <MultiSelect
          options={question.options || []}
          value={value as string[]}
          onChange={(v) => onChange(v)}
        />
      );
    case "text":
      return <TextInput value={value as string} onChange={(v) => onChange(v)} />;
    case "number":
      return <NumberInput value={value as number} onChange={(v) => onChange(v)} />;
    case "dropdown":
      return (
        <Dropdown
          options={question.options || []}
          value={value as string}
          onChange={(v) => onChange(v)}
          placeholder="Search and select..."
        />
      );
    default:
      return <TextInput value={value as string} onChange={(v) => onChange(v)} />;
  }
}
