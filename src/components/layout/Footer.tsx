"use client";

import { useLanguage } from "@/lib/language-context";

export function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-gray-50 dark:bg-zinc-950 border-t border-gray-100 dark:border-zinc-800 py-12">
      <div className="container mx-auto px-4 text-center text-gray-600 dark:text-zinc-500">
        <p>&copy; {new Date().getFullYear()} AI Page. {t("footer.rights")}</p>
      </div>
    </footer>
  );
}
