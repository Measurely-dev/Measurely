"use client";
import { useTheme } from "next-themes";
import { Toaster } from "sonner";

// Wrapper component to access the current theme
export default function LayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const { theme } = useTheme();

  return (
    <>
      {children}
      <Toaster
        theme={theme === "dark" ? "dark" : "light"}
        richColors
        position="bottom-right"
        closeButton
      />
    </>
  );
}
