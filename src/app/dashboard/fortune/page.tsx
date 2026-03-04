"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useLanguage } from "@/lib/language-context";
import { useAuth } from "@/lib/auth-context";
import { useProfile } from "@/lib/use-profile";
import { FortuneGenSvg } from "@/components/ui/service-icons";
import { FortuneList } from "@/components/ui/FortuneList";

const CREDIT_COST = 5;

export default function FortunePage() {
  const { t } = useLanguage();
  const { user, loading } = useAuth();
  const { profile, refetch } = useProfile();
  const router = useRouter();

  const [birthDate, setBirthDate] = useState("");
  const [calendarType, setCalendarType] = useState<"solar" | "lunar">("solar");
  const [isLeapMonth, setIsLeapMonth] = useState(false);
  const [birthTime, setBirthTime] = useState("");
  const [timeUnknown, setTimeUnknown] = useState(false);
  const [gender, setGender] = useState<"male" | "female">("male");

  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedFortuneId, setSelectedFortuneId] = useState<string | null>(null);
  const [listRefreshKey, setListRefreshKey] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentTitle, setCurrentTitle] = useState("");
  const [copied, setCopied] = useState(false);

  const plan = profile?.plan ?? "free";
  const isFree = plan === "free";
  const hasEnoughCredits = (profile?.credits ?? 0) >= CREDIT_COST;

  const handleFortuneListLoaded = useCallback(() => {}, []);

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

  const handleGenerate = async () => {
    if (!birthDate || generating) return;
    setError(null);
    setResult(null);
    setGenerating(true);

    try {
      const res = await fetch("/api/generate-fortune", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          birth_date: birthDate,
          calendar_type: calendarType,
          is_leap_month: calendarType === "lunar" ? isLeapMonth : false,
          birth_time: timeUnknown ? null : birthTime || null,
          gender,
          title: `${birthDate} ${gender === "male" ? "남" : "여"} 사주분석`,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.error === "Insufficient credits") {
          setError(t("fortune.error.no_credits"));
        } else if (data.error === "Paid plan required") {
          setError(t("fortune.error.plan_required"));
        } else {
          setError(data.detail || data.error || t("fortune.error.generic"));
        }
        return;
      }

      setResult(data.result);
      setCurrentTitle(`${birthDate} ${gender === "male" ? "남" : "여"} 사주분석`);
      if (data.fortune) {
        setSelectedFortuneId(data.fortune.id);
      }
      setListRefreshKey((k) => k + 1);
      refetch();
    } catch {
      setError(t("fortune.error.generic"));
    } finally {
      setGenerating(false);
    }
  };

  const handleSelectFortune = async (fortune: { id: string; title: string; birth_date: string; calendar_type: string; gender: string }) => {
    setSelectedFortuneId(fortune.id);
    setCurrentTitle(fortune.title);
    setBirthDate(fortune.birth_date);
    setCalendarType(fortune.calendar_type as "solar" | "lunar");
    setGender(fortune.gender as "male" | "female");

    // Fetch the full result
    try {
      const res = await fetch(`/api/fortunes?id=${fortune.id}`);
      if (res.ok) {
        const data = await res.json();
        if (data.fortune?.result) {
          setResult(data.fortune.result);
        }
      }
    } catch {
      // ignore
    }
  };

  const handleCopy = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!result) return;
    const blob = new Blob([result], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${currentTitle || "fortune-analysis"}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="relative min-h-screen overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-violet-100/80 via-slate-50 to-indigo-100/60 dark:from-violet-950/40 dark:via-zinc-950 dark:to-indigo-950/30" />
        <svg className="absolute inset-0 w-full h-full opacity-[0.5] dark:opacity-[0.15]">
          <defs>
            <pattern id="dot-grid-fortune" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="0.8" className="fill-slate-500 dark:fill-zinc-400" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dot-grid-fortune)" />
        </svg>
        <motion.div
          className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-violet-400/40 dark:bg-violet-600/20 blur-3xl"
          animate={{ x: [0, 40, 0], y: [0, 30, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/3 -right-40 w-[420px] h-[420px] rounded-full bg-indigo-400/35 dark:bg-indigo-600/20 blur-3xl"
          animate={{ x: [0, -30, 0], y: [0, 40, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="flex min-h-screen">
        {/* Sidebar - Fortune List */}
        <div className={`${sidebarOpen ? "w-72 lg:w-80" : "w-0"} shrink-0 transition-all duration-300 overflow-hidden border-r border-gray-200/60 dark:border-zinc-800 bg-white/60 dark:bg-zinc-950/60 backdrop-blur-md`}>
          <div className="w-72 lg:w-80 h-screen sticky top-0">
            <FortuneList
              onSelect={handleSelectFortune}
              selectedId={selectedFortuneId}
              refreshKey={listRefreshKey}
              onListLoaded={handleFortuneListLoaded}
            />
          </div>
        </div>

        {/* Sidebar Toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="sticky top-4 z-10 -ml-3 mt-4 flex items-center justify-center w-6 h-12 rounded-r-lg bg-white/80 dark:bg-zinc-900/80 border border-l-0 border-gray-200/60 dark:border-zinc-800 backdrop-blur-sm hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`text-gray-400 dark:text-zinc-500 transition-transform ${sidebarOpen ? "" : "rotate-180"}`}
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        {/* Main Content */}
        <div className="flex-1 px-6 py-12 overflow-y-auto">
          <div className="mx-auto max-w-3xl">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="mb-8"
            >
              <button
                onClick={() => router.push("/dashboard")}
                className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-6"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5" />
                  <path d="M12 19l-7-7 7-7" />
                </svg>
                {t("fortune.back")}
              </button>

              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-violet-100 dark:bg-violet-900/30">
                  <FortuneGenSvg className="w-6 h-6 text-violet-600 dark:text-violet-400" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                    {t("fortune.title")}
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-zinc-400 mt-0.5">
                    {t("fortune.subtitle")}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Credit Info */}
            {!isFree && profile && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.05 }}
                className="mb-6 flex items-center justify-between rounded-xl border border-gray-200/60 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/60 backdrop-blur-sm px-5 py-3"
              >
                <span className="text-sm text-gray-600 dark:text-zinc-400">
                  {t("fortune.credit_cost")}: <span className="font-semibold text-violet-600 dark:text-violet-400">{CREDIT_COST} {t("pricing.credits")}</span>
                </span>
                <span className="text-sm text-gray-600 dark:text-zinc-400">
                  {t("fortune.credits_remaining")}: <span className="font-semibold text-amber-600 dark:text-amber-400">{profile.credits}</span>
                </span>
              </motion.div>
            )}

            {/* Free plan warning */}
            {isFree && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.05 }}
                className="mb-6 rounded-xl border border-amber-200/60 dark:border-amber-800/40 bg-amber-50/70 dark:bg-amber-950/20 backdrop-blur-sm px-5 py-4 text-center"
              >
                <p className="text-sm font-medium text-amber-900 dark:text-amber-200">{t("fortune.error.plan_required")}</p>
              </motion.div>
            )}

            {/* Result Preview */}
            {result && !generating && (
              <motion.div
                initial={{ opacity: 0, y: 16, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="mb-6 rounded-2xl border border-gray-200/60 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/70 backdrop-blur-sm p-4 md:p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-violet-100 dark:bg-violet-900/30">
                      <FortuneGenSvg className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                        {t("fortune.result_title")}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-zinc-400 truncate max-w-[200px]">
                        {currentTitle}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopy}
                      className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                        <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                      </svg>
                      {copied ? t("fortune.copied") : t("fortune.copy")}
                    </button>
                    <button
                      onClick={handleDownload}
                      className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400 hover:bg-violet-100 dark:hover:bg-violet-900/40 transition-colors"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                      {t("fortune.download")}
                    </button>
                  </div>
                </div>
                <div className="prose prose-sm dark:prose-invert max-w-none prose-headings:text-gray-900 dark:prose-headings:text-white prose-p:text-gray-700 dark:prose-p:text-zinc-300 prose-table:text-sm prose-th:bg-violet-50 dark:prose-th:bg-violet-900/20 prose-th:px-3 prose-th:py-2 prose-td:px-3 prose-td:py-2 prose-td:border-gray-200 dark:prose-td:border-zinc-700">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{result}</ReactMarkdown>
                </div>
              </motion.div>
            )}

            {/* Input Form */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="space-y-4 mb-4"
            >
              {/* Birth Date */}
              <div>
                <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">
                  {t("fortune.birth_date")} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="birthDate"
                  value={birthDate}
                  onChange={(e) => {
                    const v = e.target.value.replace(/[^0-9-]/g, "");
                    setBirthDate(v);
                  }}
                  placeholder={t("fortune.birth_date_placeholder")}
                  maxLength={10}
                  disabled={isFree || generating}
                  className="w-full rounded-xl border border-gray-200/60 dark:border-zinc-700 bg-white/80 dark:bg-zinc-900/70 backdrop-blur-sm px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 dark:focus:ring-violet-400/50 focus:border-violet-400 dark:focus:border-violet-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              {/* Calendar Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">
                  {t("fortune.calendar_type")}
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => { setCalendarType("solar"); setIsLeapMonth(false); }}
                    disabled={isFree || generating}
                    className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium border transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                      calendarType === "solar"
                        ? "bg-violet-600 dark:bg-violet-500 text-white border-violet-600 dark:border-violet-500"
                        : "border-gray-200/60 dark:border-zinc-700 bg-white/70 dark:bg-zinc-800/60 text-gray-700 dark:text-zinc-300 hover:bg-violet-50 dark:hover:bg-violet-900/20"
                    }`}
                  >
                    {t("fortune.solar")}
                  </button>
                  <button
                    onClick={() => setCalendarType("lunar")}
                    disabled={isFree || generating}
                    className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium border transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                      calendarType === "lunar"
                        ? "bg-violet-600 dark:bg-violet-500 text-white border-violet-600 dark:border-violet-500"
                        : "border-gray-200/60 dark:border-zinc-700 bg-white/70 dark:bg-zinc-800/60 text-gray-700 dark:text-zinc-300 hover:bg-violet-50 dark:hover:bg-violet-900/20"
                    }`}
                  >
                    {t("fortune.lunar")}
                  </button>
                </div>
              </div>

              {/* Leap Month (only for lunar) */}
              {calendarType === "lunar" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="checkbox"
                    id="leapMonth"
                    checked={isLeapMonth}
                    onChange={(e) => setIsLeapMonth(e.target.checked)}
                    disabled={isFree || generating}
                    className="h-4 w-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                  />
                  <label htmlFor="leapMonth" className="text-sm text-gray-700 dark:text-zinc-300">
                    {t("fortune.leap_month")}
                  </label>
                </motion.div>
              )}

              {/* Birth Time */}
              <div>
                <label htmlFor="birthTime" className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">
                  {t("fortune.birth_time")}
                </label>
                <div className="flex gap-3 items-center">
                  <input
                    type="text"
                    id="birthTime"
                    value={birthTime}
                    onChange={(e) => {
                      const v = e.target.value.replace(/[^0-9:]/g, "");
                      setBirthTime(v);
                    }}
                    placeholder={t("fortune.birth_time_placeholder")}
                    maxLength={5}
                    disabled={isFree || generating || timeUnknown}
                    className="flex-1 rounded-xl border border-gray-200/60 dark:border-zinc-700 bg-white/80 dark:bg-zinc-900/70 backdrop-blur-sm px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 dark:focus:ring-violet-400/50 focus:border-violet-400 dark:focus:border-violet-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <label className="flex items-center gap-2 shrink-0">
                    <input
                      type="checkbox"
                      checked={timeUnknown}
                      onChange={(e) => {
                        setTimeUnknown(e.target.checked);
                        if (e.target.checked) setBirthTime("");
                      }}
                      disabled={isFree || generating}
                      className="h-4 w-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                    />
                    <span className="text-sm text-gray-600 dark:text-zinc-400">{t("fortune.time_unknown")}</span>
                  </label>
                </div>
              </div>

              {/* Gender */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">
                  {t("fortune.gender")} <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setGender("male")}
                    disabled={isFree || generating}
                    className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium border transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                      gender === "male"
                        ? "bg-violet-600 dark:bg-violet-500 text-white border-violet-600 dark:border-violet-500"
                        : "border-gray-200/60 dark:border-zinc-700 bg-white/70 dark:bg-zinc-800/60 text-gray-700 dark:text-zinc-300 hover:bg-violet-50 dark:hover:bg-violet-900/20"
                    }`}
                  >
                    {t("fortune.male")}
                  </button>
                  <button
                    onClick={() => setGender("female")}
                    disabled={isFree || generating}
                    className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium border transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                      gender === "female"
                        ? "bg-violet-600 dark:bg-violet-500 text-white border-violet-600 dark:border-violet-500"
                        : "border-gray-200/60 dark:border-zinc-700 bg-white/70 dark:bg-zinc-800/60 text-gray-700 dark:text-zinc-300 hover:bg-violet-50 dark:hover:bg-violet-900/20"
                    }`}
                  >
                    {t("fortune.female")}
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Generate Button */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.25 }}
              className="mb-8"
            >
              <button
                onClick={handleGenerate}
                disabled={isFree || !birthDate || generating || !hasEnoughCredits}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-violet-600 dark:bg-violet-500 text-white font-semibold py-3.5 px-6 hover:bg-violet-700 dark:hover:bg-violet-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {generating ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    {t("fortune.generating")}
                  </>
                ) : (
                  <>
                    <FortuneGenSvg className="w-5 h-5" />
                    {t("fortune.generate")} ({CREDIT_COST} {t("pricing.credits")})
                  </>
                )}
              </button>
              {!hasEnoughCredits && !isFree && (
                <p className="text-xs text-red-500 dark:text-red-400 mt-2 text-center">
                  {t("fortune.error.no_credits")}
                </p>
              )}
            </motion.div>

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-6 rounded-2xl border border-red-200/60 dark:border-red-800/40 bg-red-50/70 dark:bg-red-950/20 backdrop-blur-sm p-8 flex flex-col items-center text-center"
              >
                <div className="flex items-center justify-center w-14 h-14 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500 dark:text-red-400">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-red-700 dark:text-red-300">{error}</p>
              </motion.div>
            )}

            {/* Generating animation */}
            {generating && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-2xl border border-gray-200/60 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/70 backdrop-blur-sm p-10 flex flex-col items-center"
              >
                <div className="relative w-24 h-24 mb-6">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-20 h-20 rounded-full border-4 border-violet-200 dark:border-violet-800 border-t-violet-600 dark:border-t-violet-400 animate-spin" />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl">☯️</span>
                  </div>
                </div>
                <p className="text-sm font-medium text-gray-700 dark:text-zinc-300">{t("fortune.generating_desc")}</p>
                <p className="text-xs text-gray-400 dark:text-zinc-500 mt-1">{t("fortune.generating_time")}</p>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
