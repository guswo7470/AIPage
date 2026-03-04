"use client";

import { RotatingText } from "@/components/ui/rotating-text";
import {
  ImageGenSvg,
  MusicGenSvg,
  VideoGenSvg,
  TextGenSvg,
  CodeGenSvg,
  FortuneGenSvg,
} from "@/components/ui/service-icons";
import Link from "next/link";
import { motion } from "framer-motion";
import { useLanguage } from "@/lib/language-context";
import { useAuth } from "@/lib/auth-context";

const serviceKeys = [
  { icon: ImageGenSvg, titleKey: "service.image.title", descKey: "service.image.desc" },
  { icon: MusicGenSvg, titleKey: "service.music.title", descKey: "service.music.desc" },
  { icon: VideoGenSvg, titleKey: "service.video.title", descKey: "service.video.desc" },
  { icon: TextGenSvg, titleKey: "service.text.title", descKey: "service.text.desc" },
  { icon: CodeGenSvg, titleKey: "service.code.title", descKey: "service.code.desc" },
  { icon: FortuneGenSvg, titleKey: "service.fortune.title", descKey: "service.fortune.desc" },
] as const;

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
};

export function Hero() {
  const { lang, t } = useLanguage();
  const { user } = useAuth();

  const rotatingWords =
    lang === "ko"
      ? ["이미지를", "음악을", "영상을", "코드를", "글을"]
      : ["images", "music", "videos", "code", "text"];

  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center gap-16 px-6 py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-100/80 via-slate-50 to-violet-100/60 dark:from-blue-950/40 dark:via-zinc-950 dark:to-violet-950/30" />

        {/* Dot grid pattern */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.5] dark:opacity-[0.15]">
          <defs>
            <pattern id="dot-grid" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="0.8" className="fill-slate-500 dark:fill-zinc-400" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dot-grid)" />
        </svg>

        {/* Gradient orbs */}
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

      {/* Headline */}
      <div className="text-center space-y-6 max-w-3xl">
        <p className="text-sm font-medium tracking-widest uppercase text-gray-400 dark:text-zinc-500">
          {t("hero.tag")}
        </p>
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight">
          {t("hero.prefix")}{" "}
          <RotatingText
            words={rotatingWords}
            mode="slide"
            interval={2500}
            className="text-blue-600 dark:text-blue-400"
          />{" "}
          <br className="hidden sm:block" />
          {t("hero.suffix")}
        </h1>
        <p className="text-base md:text-lg text-gray-500 dark:text-zinc-400 max-w-xl mx-auto leading-relaxed">
          {t("hero.desc1")}
          <br className="hidden sm:block" />
          {t("hero.desc2")}
        </p>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <Link
            href={user ? "/dashboard" : "/login"}
            className="inline-flex items-center justify-center h-12 px-8 bg-gray-900 dark:bg-white text-white dark:text-zinc-900 text-sm font-medium rounded-full hover:bg-gray-800 dark:hover:bg-zinc-200 transition-colors"
          >
            {t("hero.cta.primary")}
          </Link>
          <Link
            href="/about"
            className="inline-flex items-center justify-center h-12 px-8 border border-gray-200 dark:border-zinc-700 text-sm font-medium rounded-full text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
          >
            {t("hero.cta.secondary")}
          </Link>
        </div>
      </div>

      {/* Service Cards */}
      <motion.div
        className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 w-full max-w-4xl"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
      >
        {serviceKeys.map((service) => (
          <motion.div
            key={service.titleKey}
            variants={cardVariants}
            className="group flex flex-col items-center gap-4 rounded-2xl border border-gray-200/60 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/60 backdrop-blur-sm p-6 md:p-8 hover:border-gray-300/60 dark:hover:border-zinc-700 hover:bg-white/90 dark:hover:bg-zinc-900/80 hover:shadow-lg dark:hover:shadow-zinc-900/40 transition-all cursor-pointer"
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
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
