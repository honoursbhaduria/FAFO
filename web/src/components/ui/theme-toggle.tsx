"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";

export function ThemeToggle({ light }: { light?: boolean }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={`p-2 rounded-xl transition-colors ${
        light ? "text-white/80" : "text-slate-500"
      }`}>
        <Sun className="h-5 w-5" />
      </div>
    );
  }

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className={`p-2 rounded-xl transition-colors flex items-center justify-center ${
        light 
          ? "text-white hover:bg-white/10" 
          : "text-slate-900 hover:bg-slate-100 dark:text-white dark:hover:bg-slate-800"
      }`}
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <Sun className="h-5 w-5" />
      ) : (
        <Moon className="h-5 w-5" />
      )}
    </motion.button>
  );
}
