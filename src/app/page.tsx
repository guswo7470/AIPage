"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useLanguage } from "@/lib/language-context";
import { useAuth } from "@/lib/auth-context";
import { PricingModal } from "@/components/ui/PricingModal";
import {
  ImageGenSvg,
  MusicGenSvg,
  VideoGenSvg,
  TextGenSvg,
  CodeGenSvg,
  FortuneGenSvg,
  CalorieGenSvg,
  MathGenSvg,
  DocumentGenSvg,
} from "@/components/ui/service-icons";

const services = [
  {
    icon: ImageGenSvg,
    titleKey: "service.image.title",
    descKey: "service.image.desc",
    detailKey: "services.image.detail",
    featureKeys: ["services.image.feature1", "services.image.feature2", "services.image.feature3"],
    usecaseKeys: ["services.image.usecase1", "services.image.usecase2", "services.image.usecase3"],
    gradient: "from-pink-500/10 to-rose-500/10 dark:from-pink-500/5 dark:to-rose-500/5",
    accent: "text-pink-600 dark:text-pink-400",
    border: "hover:border-pink-300 dark:hover:border-pink-700",
  },
  {
    icon: MusicGenSvg,
    titleKey: "service.music.title",
    descKey: "service.music.desc",
    detailKey: "services.music.detail",
    featureKeys: ["services.music.feature1", "services.music.feature2", "services.music.feature3"],
    usecaseKeys: ["services.music.usecase1", "services.music.usecase2", "services.music.usecase3"],
    gradient: "from-violet-500/10 to-purple-500/10 dark:from-violet-500/5 dark:to-purple-500/5",
    accent: "text-violet-600 dark:text-violet-400",
    border: "hover:border-violet-300 dark:hover:border-violet-700",
  },
  {
    icon: VideoGenSvg,
    titleKey: "service.video.title",
    descKey: "service.video.desc",
    detailKey: "services.video.detail",
    featureKeys: ["services.video.feature1", "services.video.feature2", "services.video.feature3"],
    usecaseKeys: ["services.video.usecase1", "services.video.usecase2", "services.video.usecase3"],
    gradient: "from-blue-500/10 to-cyan-500/10 dark:from-blue-500/5 dark:to-cyan-500/5",
    accent: "text-blue-600 dark:text-blue-400",
    border: "hover:border-blue-300 dark:hover:border-blue-700",
  },
  {
    icon: TextGenSvg,
    titleKey: "service.text.title",
    descKey: "service.text.desc",
    detailKey: "services.text.detail",
    featureKeys: ["services.text.feature1", "services.text.feature2", "services.text.feature3"],
    usecaseKeys: ["services.text.usecase1", "services.text.usecase2", "services.text.usecase3"],
    gradient: "from-emerald-500/10 to-teal-500/10 dark:from-emerald-500/5 dark:to-teal-500/5",
    accent: "text-emerald-600 dark:text-emerald-400",
    border: "hover:border-emerald-300 dark:hover:border-emerald-700",
  },
  {
    icon: CodeGenSvg,
    titleKey: "service.code.title",
    descKey: "service.code.desc",
    detailKey: "services.code.detail",
    featureKeys: ["services.code.feature1", "services.code.feature2", "services.code.feature3"],
    usecaseKeys: ["services.code.usecase1", "services.code.usecase2", "services.code.usecase3"],
    gradient: "from-amber-500/10 to-orange-500/10 dark:from-amber-500/5 dark:to-orange-500/5",
    accent: "text-amber-600 dark:text-amber-400",
    border: "hover:border-amber-300 dark:hover:border-amber-700",
  },
  {
    icon: FortuneGenSvg,
    titleKey: "service.fortune.title",
    descKey: "service.fortune.desc",
    detailKey: "services.fortune.detail",
    featureKeys: ["services.fortune.feature1", "services.fortune.feature2", "services.fortune.feature3"],
    usecaseKeys: ["services.fortune.usecase1", "services.fortune.usecase2", "services.fortune.usecase3"],
    gradient: "from-sky-500/10 to-indigo-500/10 dark:from-sky-500/5 dark:to-indigo-500/5",
    accent: "text-sky-600 dark:text-sky-400",
    border: "hover:border-sky-300 dark:hover:border-sky-700",
  },
  {
    icon: CalorieGenSvg,
    titleKey: "service.calorie.title",
    descKey: "service.calorie.desc",
    detailKey: "services.calorie.detail",
    featureKeys: ["services.calorie.feature1", "services.calorie.feature2", "services.calorie.feature3"],
    usecaseKeys: ["services.calorie.usecase1", "services.calorie.usecase2", "services.calorie.usecase3"],
    gradient: "from-lime-500/10 to-green-500/10 dark:from-lime-500/5 dark:to-green-500/5",
    accent: "text-lime-600 dark:text-lime-400",
    border: "hover:border-lime-300 dark:hover:border-lime-700",
  },
  {
    icon: MathGenSvg,
    titleKey: "service.math.title",
    descKey: "service.math.desc",
    detailKey: "services.math.detail",
    featureKeys: ["services.math.feature1", "services.math.feature2", "services.math.feature3"],
    usecaseKeys: ["services.math.usecase1", "services.math.usecase2", "services.math.usecase3"],
    gradient: "from-red-500/10 to-rose-500/10 dark:from-red-500/5 dark:to-rose-500/5",
    accent: "text-red-600 dark:text-red-400",
    border: "hover:border-red-300 dark:hover:border-red-700",
  },
  {
    icon: DocumentGenSvg,
    titleKey: "service.document.title",
    descKey: "service.document.desc",
    detailKey: "services.document.detail",
    featureKeys: ["services.document.feature1", "services.document.feature2", "services.document.feature3"],
    usecaseKeys: ["services.document.usecase1", "services.document.usecase2", "services.document.usecase3"],
    gradient: "from-cyan-500/10 to-sky-500/10 dark:from-cyan-500/5 dark:to-sky-500/5",
    accent: "text-cyan-600 dark:text-cyan-400",
    border: "hover:border-cyan-300 dark:hover:border-cyan-700",
  },
] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

export default function Home() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [showPricing, setShowPricing] = useState(false);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center px-6 pt-32 pb-20 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-100/80 via-slate-50 to-violet-100/60 dark:from-blue-950/40 dark:via-zinc-950 dark:to-violet-950/30" />
          <svg className="absolute inset-0 w-full h-full opacity-[0.5] dark:opacity-[0.15]">
            <defs>
              <pattern id="dot-grid-services" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
                <circle cx="1" cy="1" r="0.8" className="fill-slate-500 dark:fill-zinc-400" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dot-grid-services)" />
          </svg>
          <motion.div
            className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-blue-400/30 dark:bg-blue-600/15 blur-3xl"
            animate={{ x: [0, 40, 0], y: [0, 30, 0] }}
            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute top-1/3 -right-40 w-[420px] h-[420px] rounded-full bg-violet-400/25 dark:bg-violet-600/15 blur-3xl"
            animate={{ x: [0, -30, 0], y: [0, 40, 0] }}
            transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        <motion.div
          className="text-center space-y-6 max-w-3xl"
          initial="hidden"
          animate="visible"
          variants={stagger}
        >
          <motion.p
            variants={fadeUp}
            className="text-sm font-medium tracking-widest uppercase text-gray-400 dark:text-zinc-500"
          >
            {t("services.hero.tag")}
          </motion.p>
          <motion.h1
            variants={fadeUp}
            className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight whitespace-pre-line"
          >
            {t("services.hero.title")}
          </motion.h1>
          <motion.p
            variants={fadeUp}
            className="text-base md:text-lg text-gray-500 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed"
          >
            {t("services.hero.desc")}
          </motion.p>
          <motion.div variants={fadeUp}>
            <Link
              href={user ? "/dashboard" : "/login"}
              className="inline-flex items-center justify-center h-12 px-8 bg-gray-900 dark:bg-white text-white dark:text-zinc-900 text-sm font-medium rounded-full hover:bg-gray-800 dark:hover:bg-zinc-200 transition-colors"
            >
              {t("services.cta")}
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Service Cards Grid */}
      <section className="px-6 py-20">
        <motion.div
          className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
        >
          {services.map((service) => (
            <motion.div
              key={service.titleKey}
              variants={fadeUp}
              className={`group flex flex-col rounded-2xl border border-gray-200/60 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/60 backdrop-blur-sm overflow-hidden transition-all hover:shadow-lg dark:hover:shadow-zinc-900/40 ${service.border}`}
            >
              {/* Header */}
              <div className={`bg-gradient-to-br ${service.gradient} p-6`}>
                <div className={`w-12 h-12 rounded-xl bg-white/80 dark:bg-zinc-800/80 flex items-center justify-center ${service.accent} mb-4`}>
                  <service.icon className="w-7 h-7" />
                </div>
                <h2 className="text-xl font-bold tracking-tight">
                  {t(service.titleKey)}
                </h2>
                <p className={`text-sm font-medium mt-1 ${service.accent}`}>
                  {t(service.descKey)}
                </p>
              </div>

              {/* Description */}
              <div className="p-6 flex-1">
                <p className="text-sm text-gray-600 dark:text-zinc-400 leading-relaxed mb-5">
                  {t(service.detailKey)}
                </p>

                {/* Features */}
                <h3 className="text-[11px] font-semibold tracking-widest uppercase text-gray-400 dark:text-zinc-500 mb-3">
                  {t("services.features")}
                </h3>
                <ul className="space-y-2 mb-5">
                  {service.featureKeys.map((key) => (
                    <li key={key} className="flex items-start gap-2 text-sm text-gray-600 dark:text-zinc-400">
                      <svg className={`w-4 h-4 mt-0.5 shrink-0 ${service.accent}`} viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {t(key as any)}
                    </li>
                  ))}
                </ul>

                {/* Use Cases */}
                <h3 className="text-[11px] font-semibold tracking-widest uppercase text-gray-400 dark:text-zinc-500 mb-3">
                  {t("services.usecases")}
                </h3>
                <ul className="space-y-2">
                  {service.usecaseKeys.map((key) => (
                    <li key={key} className="flex items-start gap-2 text-sm text-gray-600 dark:text-zinc-400">
                      <svg className="w-4 h-4 mt-0.5 shrink-0 text-gray-300 dark:text-zinc-600" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                      {t(key as any)}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Pricing Comparison Section */}
      <section className="relative px-6 py-24 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/80 via-slate-50/60 to-violet-50/80 dark:from-blue-950/30 dark:via-zinc-950 dark:to-violet-950/30" />
          <svg className="absolute inset-0 w-full h-full opacity-[0.35] dark:opacity-[0.08]">
            <defs>
              <pattern id="dot-grid-pricing" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
                <circle cx="1" cy="1" r="0.8" className="fill-slate-400 dark:fill-zinc-500" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dot-grid-pricing)" />
          </svg>
        </div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={stagger}
          className="max-w-4xl mx-auto"
        >
          <motion.div variants={fadeUp} className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
              {t("services.pricing_section.title")}
            </h2>
            <p className="text-gray-500 dark:text-zinc-400 mt-3 text-base">
              {t("services.pricing_section.desc")}
            </p>
          </motion.div>

          <motion.div variants={fadeUp} className="grid md:grid-cols-2 gap-6">
            {/* Pro */}
            <div className="rounded-2xl border border-gray-200/60 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/60 backdrop-blur-sm p-7 flex flex-col">
              <div className="mb-5">
                <span className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-zinc-500">Pro</span>
                <div className="mt-2">
                  <span className="text-4xl font-bold">$20</span>
                  <span className="text-sm text-gray-400 dark:text-zinc-500"> {t("pricing.monthly")}</span>
                </div>
              </div>

              <ul className="space-y-3 flex-1 mb-6">
                <li className="flex items-center gap-2.5 text-sm text-gray-600 dark:text-zinc-400">
                  <svg className="w-4 h-4 shrink-0 text-blue-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                  100 {t("pricing.credits")} / {t("pricing.monthly").replace("/ ", "")}
                </li>
                <li className="flex items-center gap-2.5 text-sm text-gray-600 dark:text-zinc-400">
                  <svg className="w-4 h-4 shrink-0 text-blue-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                  {t("pricing.all_services")}
                </li>
                <li className="flex items-center gap-2.5 text-sm text-gray-600 dark:text-zinc-400">
                  <svg className="w-4 h-4 shrink-0 text-gray-300 dark:text-zinc-600" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" /></svg>
                  {t("pricing.quality")}: {t("pricing.quality.pro")}
                </li>
                <li className="flex items-center gap-2.5 text-sm text-gray-600 dark:text-zinc-400">
                  <svg className="w-4 h-4 shrink-0 text-gray-300 dark:text-zinc-600" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" /></svg>
                  {t("pricing.performance")}: {t("pricing.performance.pro")}
                </li>
              </ul>

              <button
                onClick={() => setShowPricing(true)}
                className="w-full h-11 rounded-lg text-sm font-medium bg-gray-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-gray-800 dark:hover:bg-zinc-200 transition-colors"
              >
                {t("pricing.select")}
              </button>
            </div>

            {/* Ultra */}
            <div className="relative rounded-2xl border-2 border-blue-500/60 dark:border-blue-500/40 bg-white/70 dark:bg-zinc-900/60 backdrop-blur-sm p-7 flex flex-col">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-blue-600 text-white text-[11px] font-semibold tracking-wide">
                BEST VALUE
              </div>

              <div className="mb-5">
                <span className="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">Ultra</span>
                <div className="mt-2">
                  <span className="text-4xl font-bold">$45</span>
                  <span className="text-sm text-gray-400 dark:text-zinc-500"> {t("pricing.monthly")}</span>
                </div>
              </div>

              <ul className="space-y-3 flex-1 mb-6">
                <li className="flex items-center gap-2.5 text-sm text-gray-600 dark:text-zinc-400">
                  <svg className="w-4 h-4 shrink-0 text-blue-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                  300 {t("pricing.credits")} / {t("pricing.monthly").replace("/ ", "")}
                </li>
                <li className="flex items-center gap-2.5 text-sm text-gray-600 dark:text-zinc-400">
                  <svg className="w-4 h-4 shrink-0 text-blue-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                  {t("pricing.all_services")}
                </li>
                <li className="flex items-center gap-2.5 text-sm text-gray-600 dark:text-zinc-400">
                  <svg className="w-4 h-4 shrink-0 text-blue-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                  {t("pricing.quality")}: <span className="font-medium text-gray-900 dark:text-white">{t("pricing.quality.ultra")}</span>
                </li>
                <li className="flex items-center gap-2.5 text-sm text-gray-600 dark:text-zinc-400">
                  <svg className="w-4 h-4 shrink-0 text-blue-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                  {t("pricing.performance")}: <span className="font-medium text-gray-900 dark:text-white">{t("pricing.performance.ultra")}</span>
                </li>
              </ul>

              <button
                onClick={() => setShowPricing(true)}
                className="w-full h-11 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-400 transition-colors"
              >
                {t("pricing.select")}
              </button>
            </div>
          </motion.div>
        </motion.div>
      </section>

      <PricingModal open={showPricing} onClose={() => setShowPricing(false)} />
    </div>
  );
}
