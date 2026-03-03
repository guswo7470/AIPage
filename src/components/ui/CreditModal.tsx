"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/lib/language-context";
import { useAuth } from "@/lib/auth-context";
import { useProfile } from "@/lib/use-profile";

interface CreditModalProps {
  open: boolean;
  onClose: () => void;
}

const packs = [
  { key: "credits_100", credits: 100, price: 20 },
  { key: "credits_150", credits: 150, price: 30 },
  { key: "credits_300", credits: 300, price: 45 },
] as const;

export function CreditModal({ open, onClose }: CreditModalProps) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { profile } = useProfile();
  const [loadingPack, setLoadingPack] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const handleCheckout = async (packKey: string) => {
    setLoadingPack(packKey);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: packKey,
          customerEmail: user?.email,
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.open(data.url, "_blank");
        onClose();
      }
    } catch (err) {
      console.error("Checkout error:", err);
    } finally {
      setLoadingPack(null);
    }
  };

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] flex items-center justify-center px-4"
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg rounded-2xl border border-gray-200/60 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-2xl"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1 text-gray-400 dark:text-zinc-500 hover:text-gray-600 dark:hover:text-zinc-300 transition-colors"
              aria-label="Close"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            <h2 className="text-lg font-bold tracking-tight mb-2">
              {t("credits.title")}
            </h2>

            {profile && (
              <p className="text-sm text-gray-500 dark:text-zinc-400 mb-6">
                {t("profile.credits")}: <span className="font-semibold text-gray-900 dark:text-white">{profile.credits}</span>
              </p>
            )}

            <div className="grid grid-cols-3 gap-4">
              {packs.map((pack) => (
                <div
                  key={pack.key}
                  className="flex flex-col items-center gap-3 rounded-xl border border-gray-200/60 dark:border-zinc-700 bg-gray-50/50 dark:bg-zinc-800/50 p-5 transition-all hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md"
                >
                  <span className="text-3xl font-bold">{pack.credits}</span>
                  <span className="text-xs text-gray-400 dark:text-zinc-500 uppercase tracking-wider">
                    {t("pricing.credits")}
                  </span>
                  <span className="text-lg font-semibold">${pack.price}</span>
                  <button
                    onClick={() => handleCheckout(pack.key)}
                    disabled={loadingPack !== null}
                    className="mt-1 w-full h-9 rounded-lg bg-gray-900 dark:bg-white text-white dark:text-zinc-900 text-sm font-medium hover:bg-gray-800 dark:hover:bg-zinc-200 transition-colors disabled:opacity-50"
                  >
                    {loadingPack === pack.key ? "..." : t("credits.buy")}
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
