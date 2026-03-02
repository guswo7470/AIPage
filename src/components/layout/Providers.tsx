"use client";

import { ThemeProvider } from "@/lib/theme-context";
import { LanguageProvider } from "@/lib/language-context";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <LanguageProvider>{children}</LanguageProvider>
    </ThemeProvider>
  );
}
