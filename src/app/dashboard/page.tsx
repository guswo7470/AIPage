"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/lib/language-context";
import { useAuth } from "@/lib/auth-context";
import { useProfile } from "@/lib/use-profile";
import { PricingModal } from "@/components/ui/PricingModal";
import { CreditModal } from "@/components/ui/CreditModal";
import {
  ImageGenSvg,
  MusicGenSvg,
  VideoGenSvg,
  TextGenSvg,
  CodeGenSvg,
  ChatGenSvg,
} from "@/components/ui/service-icons";

const serviceKeys = [
  { key: "image", icon: ImageGenSvg, titleKey: "service.image.title", descKey: "service.image.desc" },
  { key: "music", icon: MusicGenSvg, titleKey: "service.music.title", descKey: "service.music.desc" },
  { key: "video", icon: VideoGenSvg, titleKey: "service.video.title", descKey: "service.video.desc" },
  { key: "text", icon: TextGenSvg, titleKey: "service.text.title", descKey: "service.text.desc" },
  { key: "code", icon: CodeGenSvg, titleKey: "service.code.title", descKey: "service.code.desc" },
  { key: "chat", icon: ChatGenSvg, titleKey: "service.chat.title", descKey: "service.chat.desc" },
] as const;


export default function DashboardPage() {
  const { t } = useLanguage();
  const { user, loading } = useAuth();
  const { profile } = useProfile();
  const router = useRouter();
  const [showPricing, setShowPricing] = useState(false);
  const [showCredits, setShowCredits] = useState(false);

  const plan = profile?.plan ?? "free";
  const isFree = plan === "free";

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900 dark:border-zinc-600 dark:border-t-white" />
      </div>
    );
  }

  const displayName = user.user_metadata?.full_name || user.email?.split("@")[0] || "";

  return (
    <section className="relative min-h-screen px-6 py-12 overflow-hidden">
      {/* Background — same as Hero */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-100/80 via-slate-50 to-violet-100/60 dark:from-blue-950/40 dark:via-zinc-950 dark:to-violet-950/30" />
        <svg className="absolute inset-0 w-full h-full opacity-[0.5] dark:opacity-[0.15]">
          <defs>
            <pattern id="dot-grid-dashboard" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="0.8" className="fill-slate-500 dark:fill-zinc-400" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dot-grid-dashboard)" />
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
        <motion.div
          className="absolute -bottom-24 left-1/3 w-[380px] h-[380px] rounded-full bg-cyan-400/30 dark:bg-cyan-600/15 blur-3xl"
          animate={{ x: [0, 35, 0], y: [0, -25, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="mx-auto max-w-4xl">
        {/* Welcome */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-12"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {user.user_metadata?.avatar_url && (
                <img
                  src={user.user_metadata.avatar_url}
                  alt=""
                  width={48}
                  height={48}
                  className="rounded-full"
                  referrerPolicy="no-referrer"
                />
              )}
              <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                  {displayName}{t("dashboard.welcome").startsWith("W") ? `, ${t("dashboard.welcome")}!` : `님, ${t("dashboard.welcome")}!`}
                </h1>
                <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">
                  {t("dashboard.subtitle")}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Banners */}
        {isFree && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="mb-8 flex items-center gap-4 rounded-xl border border-amber-200/60 dark:border-amber-800/40 bg-amber-50/70 dark:bg-amber-950/20 backdrop-blur-sm px-5 py-4"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500 dark:text-amber-400 shrink-0">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0110 0v4" />
            </svg>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-amber-900 dark:text-amber-200">
                {t("dashboard.locked.title")}
              </p>
              <p className="text-xs text-amber-700/70 dark:text-amber-400/60 mt-0.5">
                {t("dashboard.locked.desc")}
              </p>
            </div>
            <button
              onClick={() => setShowPricing(true)}
              className="shrink-0 text-xs font-medium px-4 py-2 rounded-lg bg-amber-500 dark:bg-amber-600 text-white hover:bg-amber-600 dark:hover:bg-amber-500 transition-colors"
            >
              {t("dashboard.locked.cta")}
            </button>
          </motion.div>
        )}

        {profile?.subscription_status === "canceled" && !isFree && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="mb-8 flex items-center gap-3 rounded-xl border border-orange-200/60 dark:border-orange-800/40 bg-orange-50/70 dark:bg-orange-950/20 backdrop-blur-sm px-5 py-4"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-500 dark:text-orange-400 shrink-0">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <p className="text-sm text-orange-800 dark:text-orange-200">
              {t("dashboard.cancel_pending")}
            </p>
          </motion.div>
        )}

        {/* Credit bar for Pro+ users */}
        {!isFree && profile && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="mb-8 flex items-center gap-4 rounded-xl border border-gray-200/60 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/60 backdrop-blur-sm px-5 py-4"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500 dark:text-amber-400 shrink-0">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="16" />
              <line x1="8" y1="12" x2="16" y2="12" />
            </svg>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {t("profile.credits")}: <span className="text-amber-600 dark:text-amber-400">{profile.credits}</span>
              </p>
            </div>
            <button
              onClick={() => setShowCredits(true)}
              className="shrink-0 text-xs font-medium px-4 py-2 rounded-lg bg-gray-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-gray-800 dark:hover:bg-zinc-200 transition-colors"
            >
              {t("credits.buy")}
            </button>
          </motion.div>
        )}

        {/* Service Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {serviceKeys.map((service, index) => (
            <motion.div
              key={service.key}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: isFree ? 0.5 : 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.08, ease: [0.25, 0.46, 0.45, 0.94] }}
              className={`group relative flex flex-col items-center gap-4 rounded-2xl border backdrop-blur-sm p-6 md:p-8 transition-all ${
                isFree
                  ? "border-gray-200/60 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/60 cursor-not-allowed"
                  : "border-gray-200/60 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/60 hover:border-gray-300/60 dark:hover:border-zinc-700 hover:bg-white/90 dark:hover:bg-zinc-900/80 hover:shadow-lg dark:hover:shadow-zinc-900/40 cursor-pointer"
              }`}
            >
              <service.icon className={`w-10 h-10 md:w-12 md:h-12 transition-colors ${
                isFree
                  ? "text-gray-300 dark:text-zinc-600"
                  : "text-gray-400 dark:text-zinc-500 group-hover:text-blue-600 dark:group-hover:text-blue-400"
              }`} />
              <div className="text-center">
                <h3 className="text-sm md:text-base font-semibold tracking-tight">
                  {t(service.titleKey)}
                </h3>
                <p className="text-xs md:text-sm text-gray-400 dark:text-zinc-500 mt-1">
                  {t(service.descKey)}
                </p>
              </div>

              {/* Badge */}
              <span className="absolute top-3 right-3">
                {isFree ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 dark:text-zinc-500">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0110 0v4" />
                  </svg>
                ) : (
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-400 dark:text-zinc-500">
                    {t("dashboard.coming_soon")}
                  </span>
                )}
              </span>
            </motion.div>
          ))}
        </div>
      </div>

      <PricingModal open={showPricing} onClose={() => setShowPricing(false)} />
      <CreditModal open={showCredits} onClose={() => setShowCredits(false)} />
    </section>
  );
}
