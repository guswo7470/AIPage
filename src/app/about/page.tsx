"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useLanguage } from "@/lib/language-context";
import { useAuth } from "@/lib/auth-context";
import { PricingModal } from "@/components/ui/PricingModal";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const values = [
  {
    titleKey: "about.value1.title",
    descKey: "about.value1.desc",
    gradient: "from-blue-500/10 to-cyan-500/10 dark:from-blue-500/5 dark:to-cyan-500/5",
    accent: "text-blue-600 dark:text-blue-400",
    iconBg: "bg-blue-100 dark:bg-blue-900/40",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
        <line x1="2" y1="12" x2="22" y2="12" />
      </svg>
    ),
  },
  {
    titleKey: "about.value2.title",
    descKey: "about.value2.desc",
    gradient: "from-violet-500/10 to-purple-500/10 dark:from-violet-500/5 dark:to-purple-500/5",
    accent: "text-violet-600 dark:text-violet-400",
    iconBg: "bg-violet-100 dark:bg-violet-900/40",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
        <line x1="12" y1="2" x2="12" y2="22" />
      </svg>
    ),
  },
  {
    titleKey: "about.value3.title",
    descKey: "about.value3.desc",
    gradient: "from-amber-500/10 to-orange-500/10 dark:from-amber-500/5 dark:to-orange-500/5",
    accent: "text-amber-600 dark:text-amber-400",
    iconBg: "bg-amber-100 dark:bg-amber-900/40",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
  },
  {
    titleKey: "about.value4.title",
    descKey: "about.value4.desc",
    gradient: "from-emerald-500/10 to-teal-500/10 dark:from-emerald-500/5 dark:to-teal-500/5",
    accent: "text-emerald-600 dark:text-emerald-400",
    iconBg: "bg-emerald-100 dark:bg-emerald-900/40",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0110 0v4" />
      </svg>
    ),
  },
];

const steps = [
  { numKey: "about.step1.num", titleKey: "about.step1.title", descKey: "about.step1.desc" },
  { numKey: "about.step2.num", titleKey: "about.step2.title", descKey: "about.step2.desc" },
  { numKey: "about.step3.num", titleKey: "about.step3.title", descKey: "about.step3.desc" },
];

export default function AboutPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [showPricing, setShowPricing] = useState(false);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center px-6 pt-32 pb-20 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-violet-100/80 via-slate-50 to-blue-100/60 dark:from-violet-950/40 dark:via-zinc-950 dark:to-blue-950/30" />
          <svg className="absolute inset-0 w-full h-full opacity-[0.5] dark:opacity-[0.15]">
            <defs>
              <pattern id="dot-grid-about" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
                <circle cx="1" cy="1" r="0.8" className="fill-slate-500 dark:fill-zinc-400" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dot-grid-about)" />
          </svg>
          <motion.div
            className="absolute -top-40 left-1/4 w-[480px] h-[480px] rounded-full bg-violet-400/30 dark:bg-violet-600/15 blur-3xl"
            animate={{ x: [0, -30, 0], y: [0, 40, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute bottom-0 -right-32 w-[400px] h-[400px] rounded-full bg-blue-400/25 dark:bg-blue-600/15 blur-3xl"
            animate={{ x: [0, 30, 0], y: [0, -30, 0] }}
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
            className="text-sm font-medium tracking-widest uppercase text-violet-600 dark:text-violet-400"
          >
            {t("about.hero.tag")}
          </motion.p>
          <motion.h1
            variants={fadeUp}
            className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight whitespace-pre-line"
          >
            {t("about.hero.title")}
          </motion.h1>
          <motion.p
            variants={fadeUp}
            className="text-base md:text-lg text-gray-500 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed"
          >
            {t("about.hero.desc")}
          </motion.p>
        </motion.div>
      </section>

      {/* Mission Section */}
      <section className="px-6 py-20">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={stagger}
          className="max-w-4xl mx-auto"
        >
          <motion.div variants={fadeUp} className="flex flex-col md:flex-row gap-10 md:gap-16 items-start">
            {/* Left */}
            <div className="md:w-2/5 shrink-0">
              <p className="text-sm font-medium tracking-widest uppercase text-blue-600 dark:text-blue-400 mb-3">
                {t("about.mission.tag")}
              </p>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight leading-snug">
                {t("about.mission.title")}
              </h2>
            </div>
            {/* Right */}
            <div className="md:w-3/5">
              <div className="border-l-2 border-blue-500/40 dark:border-blue-400/30 pl-6">
                <p className="text-gray-600 dark:text-zinc-400 leading-relaxed text-base md:text-lg">
                  {t("about.mission.desc")}
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Stats */}
      <section className="px-6 py-16">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={stagger}
          className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6"
        >
          {[
            { value: "6+", label: t("about.stats.services") },
            { value: "99.9%", label: t("about.stats.uptime") },
            { value: t("about.stats.support_value"), label: t("about.stats.support") },
            { value: "2", label: t("about.stats.plans") },
          ].map((stat) => (
            <motion.div
              key={stat.label}
              variants={fadeUp}
              className="text-center rounded-2xl border border-gray-200/60 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/60 backdrop-blur-sm p-6"
            >
              <p className="text-3xl md:text-4xl font-bold bg-gradient-to-br from-blue-600 to-violet-600 dark:from-blue-400 dark:to-violet-400 bg-clip-text text-transparent">
                {stat.value}
              </p>
              <p className="text-sm text-gray-500 dark:text-zinc-400 mt-2">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* How It Works */}
      <section className="relative px-6 py-20 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/40 to-violet-50/60 dark:from-zinc-950 dark:via-blue-950/20 dark:to-violet-950/20" />
        </div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={stagger}
          className="max-w-4xl mx-auto"
        >
          <motion.div variants={fadeUp} className="text-center mb-14">
            <p className="text-sm font-medium tracking-widest uppercase text-blue-600 dark:text-blue-400 mb-3">
              {t("about.platform.tag")}
            </p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              {t("about.platform.title")}
            </h2>
            <p className="text-gray-500 dark:text-zinc-400 mt-3 text-base max-w-xl mx-auto">
              {t("about.platform.desc")}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {steps.map((step, i) => (
              <motion.div
                key={step.numKey}
                variants={fadeUp}
                className="relative flex flex-col rounded-2xl border border-gray-200/60 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/70 backdrop-blur-sm p-7"
              >
                <span className="text-5xl font-black text-gray-100 dark:text-zinc-800 absolute top-4 right-5 select-none">
                  {t(step.numKey as any)}
                </span>
                <div className="relative">
                  <h3 className="text-lg font-bold tracking-tight mb-3">
                    {t(step.titleKey as any)}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-zinc-400 leading-relaxed">
                    {t(step.descKey as any)}
                  </p>
                </div>
                {/* Connector line (not on last) */}
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-px bg-gray-200 dark:bg-zinc-700" />
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Values Section */}
      <section className="px-6 py-20">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={stagger}
          className="max-w-4xl mx-auto"
        >
          <motion.div variants={fadeUp} className="text-center mb-12">
            <p className="text-sm font-medium tracking-widest uppercase text-violet-600 dark:text-violet-400 mb-3">
              {t("about.values.tag")}
            </p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              {t("about.values.title")}
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-5">
            {values.map((value) => (
              <motion.div
                key={value.titleKey}
                variants={fadeUp}
                className={`flex gap-5 p-6 rounded-2xl border border-gray-200/60 dark:border-zinc-800 bg-gradient-to-br ${value.gradient} backdrop-blur-sm hover:shadow-md transition-all`}
              >
                <div className={`shrink-0 w-12 h-12 rounded-xl ${value.iconBg} flex items-center justify-center ${value.accent}`}>
                  {value.icon}
                </div>
                <div>
                  <h3 className={`font-bold tracking-tight mb-1.5 ${value.accent}`}>
                    {t(value.titleKey as any)}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-zinc-400 leading-relaxed">
                    {t(value.descKey as any)}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Story Section */}
      <section className="relative px-6 py-20 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-50/60 via-slate-50/40 to-emerald-50/60 dark:from-violet-950/20 dark:via-zinc-950 dark:to-emerald-950/15" />
          <svg className="absolute inset-0 w-full h-full opacity-[0.3] dark:opacity-[0.06]">
            <defs>
              <pattern id="dot-grid-story" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
                <circle cx="1" cy="1" r="0.8" className="fill-slate-400 dark:fill-zinc-500" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dot-grid-story)" />
          </svg>
        </div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={stagger}
          className="max-w-4xl mx-auto"
        >
          <motion.div variants={fadeUp} className="flex flex-col md:flex-row gap-10 md:gap-16">
            {/* Left heading */}
            <div className="md:w-2/5 shrink-0">
              <p className="text-sm font-medium tracking-widest uppercase text-emerald-600 dark:text-emerald-400 mb-3">
                {t("about.story.tag")}
              </p>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight leading-snug">
                {t("about.story.title")}
              </h2>
            </div>

            {/* Right paragraphs */}
            <div className="md:w-3/5 space-y-6">
              {(["about.story.p1", "about.story.p2", "about.story.p3"] as const).map((key, i) => (
                <motion.div key={key} variants={fadeUp} className="flex gap-4">
                  <div className="shrink-0 mt-1.5 w-2 h-2 rounded-full bg-emerald-500/60 dark:bg-emerald-400/40" />
                  <p className="text-gray-600 dark:text-zinc-400 leading-relaxed text-base">
                    {t(key)}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={fadeUp}
          className="max-w-4xl mx-auto text-center rounded-3xl border border-gray-200/60 dark:border-zinc-800 bg-gradient-to-br from-violet-50/80 to-blue-50/80 dark:from-violet-950/20 dark:to-blue-950/20 backdrop-blur-sm p-10 md:p-16"
        >
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
            {t("about.cta.title")}
          </h2>
          <p className="text-gray-500 dark:text-zinc-400 mt-3 mb-8 text-base max-w-lg mx-auto">
            {t("about.cta.desc")}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => setShowPricing(true)}
              className="inline-flex items-center justify-center h-12 px-8 bg-gray-900 dark:bg-white text-white dark:text-zinc-900 text-sm font-medium rounded-full hover:bg-gray-800 dark:hover:bg-zinc-200 transition-colors"
            >
              {t("services.pricing_section.cta")}
            </button>
            <Link
              href="/services"
              className="inline-flex items-center justify-center h-12 px-8 border border-gray-200 dark:border-zinc-700 text-sm font-medium rounded-full text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
            >
              {t("about.cta.secondary")}
            </Link>
          </div>
        </motion.div>
      </section>

      <PricingModal open={showPricing} onClose={() => setShowPricing(false)} />
    </div>
  );
}
