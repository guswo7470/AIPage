"use client";

import { ThemeProvider } from "@/lib/theme-context";
import { LanguageProvider } from "@/lib/language-context";
import { AuthProvider } from "@/lib/auth-context";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>{children}</AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
