"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/lib/language-context";
import { useAuth } from "@/lib/auth-context";
import {
  ImageGenSvg,
  MusicGenSvg,
  VideoGenSvg,
  TextGenSvg,
  CodeGenSvg,
  ChatGenSvg,
} from "@/components/ui/service-icons";

const serviceKeys = [
  { icon: ImageGenSvg, titleKey: "service.image.title", descKey: "service.image.desc" },
  { icon: MusicGenSvg, titleKey: "service.music.title", descKey: "service.music.desc" },
  { icon: VideoGenSvg, titleKey: "service.video.title", descKey: "service.video.desc" },
  { icon: TextGenSvg, titleKey: "service.text.title", descKey: "service.text.desc" },
  { icon: CodeGenSvg, titleKey: "service.code.title", descKey: "service.code.desc" },
  { icon: ChatGenSvg, titleKey: "service.chat.title", descKey: "service.chat.desc" },
] as const;

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
};

export default function DashboardPage() {
  const { t } = useLanguage();
  const { user, loading } = useAuth();
  const router = useRouter();

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
        </motion.div>

        {/* Service Cards */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {serviceKeys.map((service) => (
            <motion.div
              key={service.titleKey}
              variants={cardVariants}
              className="group relative flex flex-col items-center gap-4 rounded-2xl border border-gray-200/60 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/60 backdrop-blur-sm p-6 md:p-8 hover:border-gray-300/60 dark:hover:border-zinc-700 hover:bg-white/90 dark:hover:bg-zinc-900/80 hover:shadow-lg dark:hover:shadow-zinc-900/40 transition-all cursor-pointer"
            >
              <service.icon className="w-10 h-10 md:w-12 md:h-12 text-gray-400 dark:text-zinc-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
              <div className="text-center">
                <h3 className="text-sm md:text-base font-semibold tracking-tight">
                  {t(service.titleKey)}
                </h3>
                <p className="text-xs md:text-sm text-gray-400 dark:text-zinc-500 mt-1">
                  {t(service.descKey)}
                </p>
              </div>
              <span className="absolute top-3 right-3 text-[10px] font-medium px-2 py-0.5 rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-400 dark:text-zinc-500">
                {t("dashboard.coming_soon")}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
