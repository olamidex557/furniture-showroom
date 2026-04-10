"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "admin-theme";

export default function AdminThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved =
      typeof window !== "undefined"
        ? window.localStorage.getItem(STORAGE_KEY)
        : null;

    const nextTheme = saved === "dark" ? "dark" : "light";

    setTheme(nextTheme);

    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    setMounted(true);
  }, []);

  const handleToggle = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";

    setTheme(nextTheme);

    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    window.localStorage.setItem(STORAGE_KEY, nextTheme);
  };

  if (!mounted) {
    return null;
  }

  return (
    <button type="button" onClick={handleToggle} className="admin-btn-secondary">
      {theme === "dark" ? "Light Mode" : "Dark Mode"}
    </button>
  );
}