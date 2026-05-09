"use client";

interface NumberInputProps {
  value?: number;
  onChange: (value: number) => void;
  placeholder?: string;
}

export default function NumberInput({ value, onChange, placeholder }: NumberInputProps) {
  return (
    <input
      type="number"
      value={value ?? ""}
      onChange={(e) => onChange(Number(e.target.value))}
      placeholder={placeholder || "Enter a number..."}
      autoFocus
      className="w-full px-6 py-5 bg-white border-2 border-slate-200 rounded-2xl text-lg font-medium text-brand-600 placeholder:text-slate-400 focus:outline-none focus:border-brand-600 focus:ring-4 focus:ring-brand-600/10 transition-all"
    />
  );
}
