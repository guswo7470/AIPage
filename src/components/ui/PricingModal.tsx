"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
  const currentPlan = profile?.plan ?? "free";
  const pendingPlan = profile?.pending_plan ?? null;
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const isSubscribed = currentPlan === "pro" || currentPlan === "ultra";

  const handleSelect = async (planKey: string) => {
    if (!user) {
      onClose();
      router.push("/login");
      return;
    }
    setLoadingPlan(planKey);
    setError(null);
    try {
      if (isSubscribed) {
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
            className="relative w-full max-w-2xl rounded-2xl border border-gray-200/60 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 md:p-8 shadow-2xl"
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
                const isCancelDowngrade = isCurrent && !!pendingPlan;
                const isDisabled = isCurrent && !pendingPlan;
                const isUltra = plan.key === "ultra";

                return (
                  <div
                    key={plan.key}
                    className={`flex flex-col rounded-xl border p-5 transition-all ${
                      isCurrent
                        ? "border-blue-400 dark:border-blue-600 bg-blue-50/50 dark:bg-blue-900/20 ring-1 ring-blue-400/30"
                        : isPending
                        ? "border-amber-400 dark:border-amber-600 bg-amber-50/50 dark:bg-amber-900/20 ring-1 ring-amber-400/30"
                        : "border-gray-200/60 dark:border-zinc-700 bg-gray-50/50 dark:bg-zinc-800/50 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md"
                    }`}
                  >
                    {/* Plan name + badges */}
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-sm font-bold uppercase tracking-wider">
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
                    </div>

                    {/* Price */}
                    <div className="mb-4">
                      <span className="text-3xl font-bold">${plan.price}</span>
                      <span className="text-sm text-gray-400 dark:text-zinc-500">
                        {t("pricing.monthly")}
                      </span>
                    </div>

                    {/* Features list */}
                    <ul className="space-y-2.5 mb-5 flex-1">
                      {/* Credits */}
                      <li className="flex items-center gap-2 text-sm">
                        <svg className="w-4 h-4 shrink-0 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className="text-gray-600 dark:text-zinc-400">
                          {plan.credits} {t("pricing.credits")} / {t("pricing.monthly").replace("/ ", "")}
                        </span>
                      </li>
                      {/* All services */}
                      <li className="flex items-center gap-2 text-sm">
                        <svg className="w-4 h-4 shrink-0 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className="text-gray-600 dark:text-zinc-400">
                          {t("pricing.all_services")}
                        </span>
                      </li>
                      {/* Quality */}
                      <li className="flex items-center gap-2 text-sm">
                        <svg className={`w-4 h-4 shrink-0 ${isUltra ? "text-blue-500" : "text-gray-300 dark:text-zinc-600"}`} viewBox="0 0 20 20" fill="currentColor">
                          {isUltra ? (
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          ) : (
                            <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                          )}
                        </svg>
                        <span className="text-gray-600 dark:text-zinc-400">
                          {t("pricing.quality")}: <span className={isUltra ? "font-medium text-gray-900 dark:text-white" : ""}>{isUltra ? t("pricing.quality.ultra") : t("pricing.quality.pro")}</span>
                        </span>
                      </li>
                      {/* Generations per request */}
                      <li className="flex items-center gap-2 text-sm">
                        <svg className={`w-4 h-4 shrink-0 ${isUltra ? "text-blue-500" : "text-gray-300 dark:text-zinc-600"}`} viewBox="0 0 20 20" fill="currentColor">
                          {isUltra ? (
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          ) : (
                            <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                          )}
                        </svg>
                        <span className="text-gray-600 dark:text-zinc-400">
                          {t("pricing.generations")}: <span className={isUltra ? "font-medium text-gray-900 dark:text-white" : ""}>{isUltra ? t("pricing.generations.ultra") : t("pricing.generations.pro")}</span>
                        </span>
                      </li>
                    </ul>

                    {/* Button */}
                    <button
                      onClick={() => handleSelect(plan.key)}
                      disabled={isDisabled || isPending || loadingPlan !== null}
                      className={`w-full h-10 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${
                        isDisabled
                          ? "bg-gray-200 dark:bg-zinc-700 text-gray-400 dark:text-zinc-500 cursor-not-allowed"
                          : isCancelDowngrade
                          ? "bg-amber-500 dark:bg-amber-600 text-white hover:bg-amber-600 dark:hover:bg-amber-500"
                          : isUltra
                          ? "bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-400"
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
