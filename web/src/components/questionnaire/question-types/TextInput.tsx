"use client";

interface TextInputProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function TextInput({ value = "", onChange, placeholder }: TextInputProps) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder || "Type your answer..."}
      autoFocus
      className="w-full px-6 py-5 bg-white border-2 border-slate-200 rounded-2xl text-lg font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all"
    />
  );
}
