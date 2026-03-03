"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/lib/language-context";
import { useAuth } from "@/lib/auth-context";
import { useProfile } from "@/lib/use-profile";
import { PricingModal } from "@/components/ui/PricingModal";
import { CreditModal } from "@/components/ui/CreditModal";

interface SubscriptionInfo {
  id: string;
  status: string;
  cancelAtPeriodEnd: boolean;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  productName: string;
  amount: number;
  currency: string;
}

interface OrderInfo {
  id: string;
  createdAt: string;
  productName: string;
  amount: number;
  currency: string;
  billingReason: string;
}

const BILLING_REASON_KEYS: Record<string, string> = {
  purchase: "subscription.reason.purchase",
  subscription_create: "subscription.reason.subscription_create",
  subscription_cycle: "subscription.reason.subscription_cycle",
  subscription_update: "subscription.reason.subscription_update",
};

export default function SubscriptionPage() {
  const { t, lang } = useLanguage();
  const { user, loading } = useAuth();
  const { profile, refetch } = useProfile();
  const router = useRouter();

  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [orders, setOrders] = useState<OrderInfo[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [showPricing, setShowPricing] = useState(false);
  const [showCredit, setShowCredit] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [uncancelLoading, setUncancelLoading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 5;

  const plan = profile?.plan ?? "free";
  const isFree = plan === "free";

  // Auth guard
  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  // Fetch subscription data from Polar
  const fetchSubscriptionData = (showLoading = true) => {
    if (!user?.email) return;
    if (showLoading) setDataLoading(true);
    fetch("/api/subscription", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: user.email }),
    })
      .then((r) => r.json())
      .then((data) => {
        setSubscription(data.subscription ?? null);
        setOrders(data.orders ?? []);
      })
      .catch(console.error)
      .finally(() => setDataLoading(false));
  };

  useEffect(() => {
    fetchSubscriptionData();
  }, [user?.email]);

  // Re-fetch on window focus (user returns from Polar checkout tab)
  useEffect(() => {
    const onFocus = () => fetchSubscriptionData(false);
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [user?.email]);

  const handleCancel = async () => {
    setCancelLoading(true);
    try {
      const res = await fetch("/api/cancel-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user?.email }),
      });
      const data = await res.json();
      if (data.success) {
        setShowCancelConfirm(false);
        // Update local subscription state
        if (subscription) {
          setSubscription({ ...subscription, cancelAtPeriodEnd: true });
        }
        await refetch();
      }
    } catch (err) {
      console.error("Cancel error:", err);
    } finally {
      setCancelLoading(false);
    }
  };

  const handleUncancel = async () => {
    setUncancelLoading(true);
    try {
      const res = await fetch("/api/uncancel-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user?.email }),
      });
      const data = await res.json();
      if (data.success) {
        if (subscription) {
          setSubscription({ ...subscription, cancelAtPeriodEnd: false });
        }
        await refetch();
      }
    } catch (err) {
      console.error("Uncancel error:", err);
    } finally {
      setUncancelLoading(false);
    }
  };

  const handleManagePayment = async () => {
    setPortalLoading(true);
    try {
      const res = await fetch("/api/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user?.email }),
      });
      const data = await res.json();
      if (data.url) {
        window.open(data.url, "_blank");
      }
    } catch (err) {
      console.error("Portal error:", err);
    } finally {
      setPortalLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(
      lang === "ko" ? "ko-KR" : "en-US",
      { year: "numeric", month: "long", day: "numeric" }
    );
  };

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString(
      lang === "ko" ? "ko-KR" : "en-US",
      { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" }
    );
  };

  const formatAmount = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900 dark:border-zinc-600 dark:border-t-white" />
      </div>
    );
  }

  return (
    <section className="relative min-h-screen px-6 py-12 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-100/80 via-slate-50 to-violet-100/60 dark:from-blue-950/40 dark:via-zinc-950 dark:to-violet-950/30" />
        <svg className="absolute inset-0 w-full h-full opacity-[0.5] dark:opacity-[0.15]">
          <defs>
            <pattern id="dot-grid-sub" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="0.8" className="fill-slate-500 dark:fill-zinc-400" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dot-grid-sub)" />
        </svg>
        <motion.div
          className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-blue-400/40 dark:bg-blue-600/20 blur-3xl"
          animate={{ x: [0, 40, 0], y: [0, 30, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/3 -right-40 w-[420px] h-[420px] rounded-full bg-violet-400/35 dark:bg-violet-600/20 blur-3xl"
          animate={{ x: [0, -30, 0], y: [0, 40, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="mx-auto max-w-3xl space-y-6">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            {t("subscription.title")}
          </h1>
        </motion.div>

        {dataLoading ? (
          <div className="flex justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900 dark:border-zinc-600 dark:border-t-white" />
          </div>
        ) : (
          <>
            {/* Section 1: Current Plan Card */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.08 }}
              className="rounded-2xl border border-gray-200/60 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/60 backdrop-blur-sm p-6"
            >
              {isFree && !subscription ? (
                /* Free user — no subscription */
                <div className="text-center py-4">
                  <p className="text-gray-500 dark:text-zinc-400 mb-4">
                    {t("subscription.no_subscription")}
                  </p>
                  <button
                    onClick={() => setShowPricing(true)}
                    className="px-6 py-2.5 rounded-lg bg-gray-900 dark:bg-white text-white dark:text-zinc-900 text-sm font-medium hover:bg-gray-800 dark:hover:bg-zinc-200 transition-colors"
                  >
                    {t("subscription.subscribe_cta")}
                  </button>
                </div>
              ) : (
                /* Active subscription */
                <div className="space-y-4">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                      profile?.pending_plan
                        ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"
                        : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                    }`}>
                      {profile?.pending_plan
                        ? `${plan.charAt(0).toUpperCase() + plan.slice(1)} → ${profile.pending_plan.charAt(0).toUpperCase() + profile.pending_plan.slice(1)}`
                        : plan.charAt(0).toUpperCase() + plan.slice(1)}
                    </span>
                    {subscription?.cancelAtPeriodEnd ? (
                      <span className="text-xs font-semibold px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400">
                        {t("profile.status.canceled")}
                      </span>
                    ) : (
                      <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">
                        {t("profile.status.active")}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-400 dark:text-zinc-500">{t("subscription.monthly_price")}</p>
                      <p className="font-semibold mt-0.5">
                        {subscription ? formatAmount(subscription.amount) : "—"}<span className="text-gray-400 dark:text-zinc-500 font-normal"> {t("pricing.monthly")}</span>
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 dark:text-zinc-500">{t("profile.credits")}</p>
                      <p className="font-semibold mt-0.5 flex items-center gap-1.5">
                        {profile?.credits ?? 0}
                        <button
                          onClick={() => setShowCredit(true)}
                          className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gray-200 dark:bg-zinc-700 text-gray-500 dark:text-zinc-400 hover:bg-gray-300 dark:hover:bg-zinc-600 transition-colors text-xs font-bold leading-none"
                          aria-label="Add credits"
                        >
                          +
                        </button>
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 dark:text-zinc-500">
                        {subscription?.cancelAtPeriodEnd ? t("subscription.ends_at") : t("subscription.next_billing")}
                      </p>
                      <p className="font-semibold mt-0.5">
                        {subscription?.currentPeriodEnd ? formatDate(subscription.currentPeriodEnd) : "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 dark:text-zinc-500">{t("subscription.status")}</p>
                      <p className="font-semibold mt-0.5">
                        {subscription?.cancelAtPeriodEnd ? t("profile.status.canceled") : t("profile.status.active")}
                      </p>
                    </div>
                  </div>

                  {/* Cancel notice */}
                  <AnimatePresence>
                    {subscription?.cancelAtPeriodEnd && subscription.currentPeriodEnd && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex items-center justify-between gap-3 rounded-xl border border-orange-200/60 dark:border-orange-800/40 bg-orange-50/70 dark:bg-orange-950/20 px-4 py-3"
                      >
                        <div className="flex items-center gap-3">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-500 dark:text-orange-400 shrink-0">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="8" x2="12" y2="12" />
                            <line x1="12" y1="16" x2="12.01" y2="16" />
                          </svg>
                          <p className="text-sm text-orange-800 dark:text-orange-200">
                            {t("subscription.canceled_notice").replace("{date}", formatDate(subscription.currentPeriodEnd))}
                          </p>
                        </div>
                        <button
                          onClick={handleUncancel}
                          disabled={uncancelLoading}
                          className="shrink-0 px-3 py-1.5 rounded-lg bg-orange-600 text-white text-xs font-medium hover:bg-orange-700 transition-colors disabled:opacity-50"
                        >
                          {uncancelLoading ? "..." : t("subscription.uncancel")}
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Action buttons */}
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => setShowPricing(true)}
                      className="px-5 py-2 rounded-lg bg-gray-900 dark:bg-white text-white dark:text-zinc-900 text-sm font-medium hover:bg-gray-800 dark:hover:bg-zinc-200 transition-colors"
                    >
                      {t("subscription.change_plan")}
                    </button>
                    {!subscription?.cancelAtPeriodEnd && (
                      <button
                        onClick={() => setShowCancelConfirm(true)}
                        className="px-5 py-2 rounded-lg border border-gray-200 dark:border-zinc-700 text-sm font-medium text-gray-600 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
                      >
                        {t("subscription.cancel")}
                      </button>
                    )}
                  </div>

                  {/* Cancel confirmation */}
                  <AnimatePresence>
                    {showCancelConfirm && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="rounded-xl border border-red-200/60 dark:border-red-800/40 bg-red-50/70 dark:bg-red-950/20 p-4 space-y-3">
                          <div className="flex items-start gap-3">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500 dark:text-red-400 shrink-0 mt-0.5">
                              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                              <line x1="12" y1="9" x2="12" y2="13" />
                              <line x1="12" y1="17" x2="12.01" y2="17" />
                            </svg>
                            <div>
                              <p className="text-sm font-medium text-red-900 dark:text-red-200">
                                {t("subscription.cancel_confirm_title")}
                              </p>
                              <p className="text-xs text-red-700/70 dark:text-red-400/60 mt-1">
                                {t("subscription.cancel_confirm_desc")}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-3 justify-end">
                            <button
                              onClick={() => setShowCancelConfirm(false)}
                              className="px-4 py-1.5 rounded-lg border border-gray-200 dark:border-zinc-700 text-sm font-medium text-gray-600 dark:text-zinc-400 hover:bg-white dark:hover:bg-zinc-800 transition-colors"
                            >
                              {t("subscription.cancel_back")}
                            </button>
                            <button
                              onClick={handleCancel}
                              disabled={cancelLoading}
                              className="px-4 py-1.5 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                            >
                              {cancelLoading ? "..." : t("subscription.cancel_confirm_btn")}
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </motion.div>

            {/* Section 2: Payment History */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.16 }}
              className="rounded-2xl border border-gray-200/60 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/60 backdrop-blur-sm p-6"
            >
              <h2 className="text-lg font-bold tracking-tight mb-4">
                {t("subscription.payment_history")}
              </h2>

              {orders.length === 0 ? (
                <p className="text-sm text-gray-400 dark:text-zinc-500 py-4 text-center">
                  {t("subscription.no_payments")}
                </p>
              ) : (
                <>
                  {/* Desktop table */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-100 dark:border-zinc-800 text-gray-400 dark:text-zinc-500">
                          <th className="text-left pb-3 font-medium">{t("subscription.date")}</th>
                          <th className="text-left pb-3 font-medium">{t("subscription.product")}</th>
                          <th className="text-left pb-3 font-medium">{t("subscription.amount")}</th>
                          <th className="text-left pb-3 font-medium">{t("subscription.type")}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map((order) => (
                          <tr key={order.id} className="border-b border-gray-50 dark:border-zinc-800/50 last:border-0">
                            <td className="py-3 text-gray-600 dark:text-zinc-300">{formatDateTime(order.createdAt)}</td>
                            <td className="py-3 font-medium">{order.productName}</td>
                            <td className="py-3 font-medium">{formatAmount(order.amount)}</td>
                            <td className="py-3 text-gray-500 dark:text-zinc-400">
                              {t((BILLING_REASON_KEYS[order.billingReason] ?? "subscription.reason.purchase") as any)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile cards */}
                  <div className="md:hidden space-y-3">
                    {orders.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map((order) => (
                      <div key={order.id} className="rounded-xl border border-gray-100 dark:border-zinc-800/50 p-4 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{order.productName}</span>
                          <span className="font-semibold">{formatAmount(order.amount)}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-400 dark:text-zinc-500">
                          <span>{formatDateTime(order.createdAt)}</span>
                          <span>{t((BILLING_REASON_KEYS[order.billingReason] ?? "subscription.reason.purchase") as any)}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {orders.length > PAGE_SIZE && (
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-zinc-800">
                      <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-zinc-700 text-sm font-medium text-gray-600 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors disabled:opacity-30 disabled:pointer-events-none"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="15 18 9 12 15 6" />
                        </svg>
                        {t("subscription.prev")}
                      </button>
                      <span className="text-sm text-gray-400 dark:text-zinc-500">
                        {t("subscription.page_info")
                          .replace("{current}", String(page))
                          .replace("{total}", String(Math.ceil(orders.length / PAGE_SIZE)))}
                      </span>
                      <button
                        onClick={() => setPage((p) => Math.min(Math.ceil(orders.length / PAGE_SIZE), p + 1))}
                        disabled={page >= Math.ceil(orders.length / PAGE_SIZE)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-zinc-700 text-sm font-medium text-gray-600 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors disabled:opacity-30 disabled:pointer-events-none"
                      >
                        {t("subscription.next")}
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
                      </button>
                    </div>
                  )}
                </>
              )}
            </motion.div>

            {/* Section 3: Payment Method */}
            {!isFree && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.24 }}
                className="rounded-2xl border border-gray-200/60 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/60 backdrop-blur-sm p-6"
              >
                <h2 className="text-lg font-bold tracking-tight mb-2">
                  {t("subscription.payment_method")}
                </h2>
                <p className="text-sm text-gray-500 dark:text-zinc-400 mb-4">
                  {t("subscription.payment_method_desc")}
                </p>
                <button
                  onClick={handleManagePayment}
                  disabled={portalLoading}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-lg border border-gray-200 dark:border-zinc-700 text-sm font-medium text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50"
                >
                  {portalLoading ? "..." : t("subscription.manage_in_polar")}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                </button>
              </motion.div>
            )}
          </>
        )}
      </div>

      <PricingModal open={showPricing} onClose={() => setShowPricing(false)} />
      <CreditModal open={showCredit} onClose={() => setShowCredit(false)} />
    </section>
  );
}
