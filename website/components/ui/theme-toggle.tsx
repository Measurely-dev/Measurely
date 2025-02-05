"use client";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { setTheme, theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(false);

  function getThemeFromCookie() {
    const cookies = document.cookie.split(";");
    const themeCookie = cookies.find((cookie) =>
      cookie.trim().startsWith("measurely-theme="),
    );
    return themeCookie ? themeCookie.split("=")[1] : "light";
  }

  function toggleTheme() {
    const currentTheme = getThemeFromCookie();
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    const cookieName = "measurely-theme";
    const cookieValue = newTheme;
    document.cookie = `${cookieName}=${cookieValue};path=/;max-age=31536000;domain=${process.env.NEXT_PUBLIC_ENV === "production" ? ".measurely.dev" : "localhost"};`;

    setTheme(newTheme);
    setIsDark(newTheme === "dark");
  }

  useEffect(() => {
    setMounted(true);
    const currentTheme = getThemeFromCookie();
    setIsDark(currentTheme === "dark");
    setTheme(currentTheme);

    // Polling interval to check for cookie changes
    const interval = setInterval(() => {
      const newTheme = getThemeFromCookie();
      if (newTheme !== theme) {
        setIsDark(newTheme === "dark");
        setTheme(newTheme);
      }
    }, 1000); // Check every second

    return () => clearInterval(interval);
  }, [setTheme, theme]);

  if (!mounted) return <div className={cn("h-8 w-16", className)} />; // Prevent hydration issues

  return (
    <div
      className={cn(
        "flex h-8 w-16 cursor-pointer rounded-full p-1 transition-all duration-300",
        isDark
          ? "border border-input bg-card"
          : "border border-input bg-background",
        className,
      )}
      onClick={toggleTheme}
      role="button"
      tabIndex={0}
    >
      <div className="flex w-full items-center justify-between">
        <div
          suppressHydrationWarning
          className={cn(
            "flex h-6 w-6 items-center justify-center rounded-full transition-transform duration-300",
            isDark
              ? "translate-x-0 transform bg-zinc-800"
              : "translate-x-8 transform bg-gray-200",
          )}
        >
          {isDark ? (
            <Moon className="h-4 w-4 text-white" strokeWidth={1.5} />
          ) : (
            <Sun className="h-4 w-4 text-gray-700" strokeWidth={1.5} />
          )}
        </div>
      </div>
    </div>
  );
}
