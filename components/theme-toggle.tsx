"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

// ponytail: one button, native API
export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const isDark = theme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="font-mono text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded border border-border"
      aria-label="Toggle theme"
    >
      {isDark ? "☀ Light" : "☾ Dark"}
    </button>
  );
}
