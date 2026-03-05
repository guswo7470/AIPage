"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/lib/language-context";
import { useAuth } from "@/lib/auth-context";
import { useProfile } from "@/lib/use-profile";
import { VideoGenSvg } from "@/components/ui/service-icons";
import { VideoList } from "@/components/ui/VideoList";

const CREDIT_COST_PRO_AUDIO = 30;
const CREDIT_COST_PRO_NO_AUDIO = 20;
const CREDIT_COST_ULTRA_AUDIO = 80;
const CREDIT_COST_ULTRA_NO_AUDIO = 40;

export default function VideoPage() {
  const { t } = useLanguage();
  const { user, loading } = useAuth();
  const { profile, refetch } = useProfile();
  const router = useRouter();

  const [prompt, setPrompt] = useState("");
  const [generateAudio, setGenerateAudio] = useState(true);

  const [generating, setGenerating] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const [listRefreshKey, setListRefreshKey] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentTitle, setCurrentTitle] = useState("");

  const plan = profile?.plan ?? "free";
  const isFree = plan === "free";
  const isUltra = plan === "ultra";
  const creditCost = isUltra
    ? (generateAudio ? CREDIT_COST_ULTRA_AUDIO : CREDIT_COST_ULTRA_NO_AUDIO)
    : (generateAudio ? CREDIT_COST_PRO_AUDIO : CREDIT_COST_PRO_NO_AUDIO);
  const hasEnoughCredits = (profile?.credits ?? 0) >= creditCost;

  const handleVideoListLoaded = useCallback(() => {}, []);

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
    if (!prompt.trim() || generating) return;
    setError(null);
    setVideoUrl(null);
    setGenerating(true);

    try {
      const res = await fetch("/api/generate-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: prompt.trim(),
          title: prompt.trim().slice(0, 60),
          generate_audio: generateAudio,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.error === "Insufficient credits") {
          setError(t("video.error.no_credits"));
        } else if (data.error === "Paid plan required") {
          setError(t("video.error.plan_required"));
        } else {
          setError(data.detail || data.error || t("video.error.generic"));
        }
        return;
      }

      setVideoUrl(data.url);
      setCurrentTitle(prompt.trim().slice(0, 60));
      if (data.video) {
        setSelectedVideoId(data.video.id);
      }
      setListRefreshKey((k) => k + 1);
      refetch();
    } catch {
      setError(t("video.error.generic"));
    } finally {
      setGenerating(false);
    }
  };

  const handleSelectVideo = (video: { id: string; title: string; file_url: string; prompt: string }) => {
    setSelectedVideoId(video.id);
    setVideoUrl(video.file_url);
    setPrompt(video.prompt);
    setCurrentTitle(video.title || video.prompt.slice(0, 40));
  };

  const handleDownload = async () => {
    if (!videoUrl) return;
    const res = await fetch(videoUrl);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${currentTitle || "ai-video"}.mp4`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="relative min-h-screen overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-100/80 via-slate-50 to-cyan-100/60 dark:from-blue-950/40 dark:via-zinc-950 dark:to-cyan-950/30" />
        <svg className="absolute inset-0 w-full h-full opacity-[0.5] dark:opacity-[0.15]">
          <defs>
            <pattern id="dot-grid-video" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="0.8" className="fill-slate-500 dark:fill-zinc-400" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dot-grid-video)" />
        </svg>
        <motion.div
          className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-blue-400/40 dark:bg-blue-600/20 blur-3xl"
          animate={{ x: [0, 40, 0], y: [0, 30, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/3 -right-40 w-[420px] h-[420px] rounded-full bg-cyan-400/35 dark:bg-cyan-600/20 blur-3xl"
          animate={{ x: [0, -30, 0], y: [0, 40, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="flex min-h-screen">
        {/* Sidebar - Video List */}
        <div className={`${sidebarOpen ? "w-72 lg:w-80" : "w-0"} shrink-0 transition-all duration-300 overflow-hidden border-r border-gray-200/60 dark:border-zinc-800 bg-white/60 dark:bg-zinc-950/60 backdrop-blur-md`}>
          <div className="w-72 lg:w-80 h-screen sticky top-0">
            <VideoList
              onSelect={handleSelectVideo}
              selectedId={selectedVideoId}
              refreshKey={listRefreshKey}
              onListLoaded={handleVideoListLoaded}
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
                {t("video.back")}
              </button>

              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30">
                  <VideoGenSvg className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                    {t("video.title")}
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-zinc-400 mt-0.5">
                    {t("video.subtitle")}
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
                  {t("video.credit_cost")}: <span className="font-semibold text-blue-600 dark:text-blue-400">{creditCost} {t("pricing.credits")}</span>
                </span>
                <span className="text-sm text-gray-600 dark:text-zinc-400">
                  {t("video.credits_remaining")}: <span className="font-semibold text-amber-600 dark:text-amber-400">{profile.credits}</span>
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
                <p className="text-sm font-medium text-amber-900 dark:text-amber-200">{t("video.error.plan_required")}</p>
              </motion.div>
            )}

            {/* Generated Video Preview */}
            {videoUrl && !generating && (
              <motion.div
                initial={{ opacity: 0, y: 16, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="mb-6 rounded-2xl border border-gray-200/60 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/70 backdrop-blur-sm p-4 md:p-5"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600 dark:text-blue-400">
                        <polygon points="5 3 19 12 5 21 5 3" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                        {t("video.result_title")}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-zinc-400 truncate max-w-[200px]">
                        {currentTitle}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleDownload}
                    className="shrink-0 inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    {t("video.download")}
                  </button>
                </div>
                <div className="rounded-xl overflow-hidden bg-black">
                  <video
                    src={videoUrl}
                    controls
                    autoPlay
                    className="w-full h-auto max-h-[500px]"
                  />
                </div>
              </motion.div>
            )}

            {/* Prompt Input */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="mb-6"
            >
              <label htmlFor="videoPrompt" className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">
                {t("video.prompt_label")} <span className="text-red-500">*</span>
              </label>
              <textarea
                id="videoPrompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                disabled={isFree || generating}
                placeholder={t("video.prompt_placeholder")}
                rows={4}
                className="w-full rounded-xl border border-gray-200/60 dark:border-zinc-700 bg-white/80 dark:bg-zinc-900/70 backdrop-blur-sm px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-blue-400/50 focus:border-blue-400 dark:focus:border-blue-600 transition-all resize-none disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </motion.div>

            {/* Audio Toggle */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
              className="mb-6"
            >
              <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">
                {t("video.audio_label")}
              </label>
              <button
                onClick={() => setGenerateAudio(!generateAudio)}
                disabled={isFree || generating}
                className={`flex items-center gap-3 w-full rounded-xl border px-5 py-3.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                  generateAudio
                    ? "border-blue-300 dark:border-blue-700 bg-blue-50/70 dark:bg-blue-950/30"
                    : "border-gray-200/60 dark:border-zinc-700 bg-white/70 dark:bg-zinc-900/60"
                }`}
              >
                <div className={`relative w-11 h-6 rounded-full transition-colors ${generateAudio ? "bg-blue-500" : "bg-gray-300 dark:bg-zinc-600"}`}>
                  <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${generateAudio ? "translate-x-[22px]" : "translate-x-0.5"}`} />
                </div>
                <div className="flex-1 text-left">
                  <span className={`text-sm font-medium ${generateAudio ? "text-blue-700 dark:text-blue-300" : "text-gray-600 dark:text-zinc-400"}`}>
                    {generateAudio ? t("video.audio_on") : t("video.audio_off")}
                  </span>
                  <p className="text-xs text-gray-500 dark:text-zinc-500 mt-0.5">
                    {generateAudio ? t("video.audio_desc_on") : t("video.audio_desc_off")}
                  </p>
                </div>
              </button>
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
                disabled={isFree || !prompt.trim() || generating || !hasEnoughCredits}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 dark:bg-blue-500 text-white font-semibold py-3.5 px-6 hover:bg-blue-700 dark:hover:bg-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {generating ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    {t("video.generating")}
                  </>
                ) : (
                  <>
                    <VideoGenSvg className="w-5 h-5" />
                    {t("video.generate")} ({creditCost} {t("pricing.credits")})
                  </>
                )}
              </button>
              {!hasEnoughCredits && !isFree && (
                <p className="text-xs text-red-500 dark:text-red-400 mt-2 text-center">
                  {t("video.error.no_credits")}
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
                    <div className="w-20 h-20 rounded-full border-4 border-blue-200 dark:border-blue-800 border-t-blue-600 dark:border-t-blue-400 animate-spin" />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <VideoGenSvg className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <p className="text-sm font-medium text-gray-700 dark:text-zinc-300">{t("video.generating_desc")}</p>
                <p className="text-xs text-gray-400 dark:text-zinc-500 mt-1">{t("video.generating_time")}</p>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
