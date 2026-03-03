"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/lib/language-context";
import { useAuth } from "@/lib/auth-context";
import { useProfile } from "@/lib/use-profile";

interface PricingModalProps {
  open: boolean;
  onClose: () => void;
}

const plans = [
  { key: "pro", name: "Pro", price: 20, credits: 100 },
  { key: "ultra", name: "Ultra", price: 45, credits: 300 },
] as const;

export function PricingModal({ open, onClose }: PricingModalProps) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { profile } = useProfile();
  const currentPlan = profile?.plan ?? "free";
  const pendingPlan = profile?.pending_plan ?? null;
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const isSubscribed = currentPlan === "pro" || currentPlan === "ultra";

  const handleSelect = async (planKey: string) => {
    setLoadingPlan(planKey);
    setError(null);
    try {
      if (isSubscribed) {
        // pending_plan이 있고 현재 플랜을 선택 → 다운그레이드 취소
        // pending_plan이 있고 다른 플랜을 선택 → 일반 변경
        // pending_plan이 없고 다른 플랜을 선택 → 업그레이드/다운그레이드
        const res = await fetch("/api/upgrade", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ plan: planKey, email: user?.email }),
        });
        const data = await res.json();
        if (data.success) {
          onClose();
          window.location.reload();
        } else {
          setError(data.error ?? "Failed to change plan");
        }
      } else {
        // 무료 사용자는 새 체크아웃 세션 생성
        const res = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            plan: planKey,
            customerEmail: user?.email,
          }),
        });
        const data = await res.json();
        if (data.url) {
          window.open(data.url, "_blank");
          onClose();
        }
      }
    } catch (err) {
      console.error("Checkout error:", err);
      setError("Network error");
    } finally {
      setLoadingPlan(null);
    }
  };

  // Lock body scroll when open
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  // Close on Escape
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
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md rounded-2xl border border-gray-200/60 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-2xl"
          >
            {/* Close button */}
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

            <h2 className="text-lg font-bold tracking-tight mb-6">
              {t("pricing.title")}
            </h2>

            {error && (
              <div className="mb-4 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200/60 dark:border-red-800/40 px-4 py-2.5 text-sm text-red-700 dark:text-red-300">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              {plans.map((plan) => {
                const isCurrent = currentPlan === plan.key;
                const isPending = pendingPlan === plan.key;
                // pending 상태에서 현재 플랜 선택 = 다운그레이드 취소
                const isCancelDowngrade = isCurrent && !!pendingPlan;
                // pending 없이 현재 플랜 = 비활성
                const isDisabled = isCurrent && !pendingPlan;

                return (
                  <div
                    key={plan.key}
                    className={`flex flex-col items-center gap-3 rounded-xl border p-5 transition-all ${
                      isCurrent
                        ? "border-blue-400 dark:border-blue-600 bg-blue-50/50 dark:bg-blue-900/20 ring-1 ring-blue-400/30"
                        : isPending
                        ? "border-amber-400 dark:border-amber-600 bg-amber-50/50 dark:bg-amber-900/20 ring-1 ring-amber-400/30"
                        : "border-gray-200/60 dark:border-zinc-700 bg-gray-50/50 dark:bg-zinc-800/50 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md"
                    }`}
                  >
                    <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-zinc-500">
                      {plan.name}
                    </span>
                    {isCurrent && (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400">
                        {t("pricing.current")}
                      </span>
                    )}
                    {isPending && (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400">
                        {t("pricing.scheduled")}
                      </span>
                    )}
                    <div className="text-center">
                      <span className="text-3xl font-bold">${plan.price}</span>
                      <span className="text-sm text-gray-400 dark:text-zinc-500">
                        {t("pricing.monthly")}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-zinc-400">
                      {plan.credits} {t("pricing.credits")}
                    </p>
                    <button
                      onClick={() => handleSelect(plan.key)}
                      disabled={isDisabled || isPending || loadingPlan !== null}
                      className={`mt-1 w-full h-9 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${
                        isDisabled
                          ? "bg-gray-200 dark:bg-zinc-700 text-gray-400 dark:text-zinc-500 cursor-not-allowed"
                          : isCancelDowngrade
                          ? "bg-amber-500 dark:bg-amber-600 text-white hover:bg-amber-600 dark:hover:bg-amber-500"
                          : "bg-gray-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-gray-800 dark:hover:bg-zinc-200"
                      }`}
                    >
                      {loadingPlan === plan.key
                        ? "..."
                        : isDisabled
                        ? t("pricing.current")
                        : isCancelDowngrade
                        ? t("pricing.cancelDowngrade")
                        : isPending
                        ? t("pricing.scheduled")
                        : isSubscribed
                        ? plan.price > (currentPlan === "pro" ? 20 : 45)
                          ? t("pricing.upgrade")
                          : t("pricing.downgrade")
                        : t("pricing.select")}
                    </button>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
