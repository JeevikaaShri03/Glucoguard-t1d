"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="w-16 h-8 rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse" />;

  const isDark = theme === "dark";

  return (
    <div className="inline-flex items-center p-1 rounded-full bg-slate-200/80 dark:bg-slate-800/80 border border-slate-300/60 dark:border-slate-700/60 transition-colors">
      {/* Light Mode Button */}
      <button
        type="button"
        onClick={() => setTheme("light")}
        className={`p-1.5 rounded-full transition-all duration-200 flex items-center justify-center ${
          !isDark
            ? "bg-white text-amber-500 shadow-sm scale-100"
            : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 scale-90"
        }`}
        aria-label="Light Mode"
      >
        <Sun className="w-4 h-4" />
      </button>

      {/* Dark Mode Button */}
      <button
        type="button"
        onClick={() => setTheme("dark")}
        className={`p-1.5 rounded-full transition-all duration-200 flex items-center justify-center ${
          isDark
            ? "bg-slate-900 text-sky-400 shadow-sm scale-100"
            : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 scale-90"
        }`}
        aria-label="Dark Mode"
      >
        <Moon className="w-4 h-4" />
      </button>
    </div>
  );
}