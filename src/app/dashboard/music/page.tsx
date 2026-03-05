"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/lib/language-context";
import { useAuth } from "@/lib/auth-context";
import { useProfile } from "@/lib/use-profile";
import { MusicGenSvg } from "@/components/ui/service-icons";
import { MusicList } from "@/components/ui/MusicList";
import { MusicPlayer } from "@/components/ui/MusicPlayer";

const CREDIT_COST_PRO = 5;
const CREDIT_COST_ULTRA = 20;

const GENRE_PRESETS = [
  { key: "pop", emoji: "🎵" },
  { key: "rock", emoji: "🎸" },
  { key: "jazz", emoji: "🎷" },
  { key: "classical", emoji: "🎻" },
  { key: "electronic", emoji: "🎹" },
  { key: "hiphop", emoji: "🎤" },
  { key: "folk", emoji: "🪕" },
  { key: "rnb", emoji: "🎶" },
] as const;

export default function MusicGenerationPage() {
  const { t } = useLanguage();
  const { user, loading } = useAuth();
  const { profile, refetch } = useProfile();
  const router = useRouter();

  const [prompt, setPrompt] = useState("");
  const [lyrics, setLyrics] = useState("");
  const [generating, setGenerating] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedMusicId, setSelectedMusicId] = useState<string | null>(null);
  const [listRefreshKey, setListRefreshKey] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [musicList, setMusicList] = useState<{ id: string; title: string; file_url: string; prompt: string; lyrics: string | null }[]>([]);
  const [currentTitle, setCurrentTitle] = useState("");

  const plan = profile?.plan ?? "free";
  const isFree = plan === "free";
  const creditCost = plan === "ultra" ? CREDIT_COST_ULTRA : CREDIT_COST_PRO;
  const hasEnoughCredits = (profile?.credits ?? 0) >= creditCost;

  const handleMusicListLoaded = useCallback((list: { id: string; title: string; file_url: string; prompt: string; lyrics: string | null }[]) => {
    setMusicList(list);
  }, []);

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
    setAudioUrl(null);
    setGenerating(true);

    try {
      const res = await fetch("/api/generate-music", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: prompt.trim(),
          lyrics: lyrics.trim() || undefined,
          title: prompt.trim().slice(0, 60),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.error === "Insufficient credits") {
          setError(t("music.error.no_credits"));
        } else if (data.error === "Paid plan required") {
          setError(t("music.error.plan_required"));
        } else {
          setError(data.detail || data.error || t("music.error.generic"));
        }
        return;
      }

      setAudioUrl(data.url);
      setCurrentTitle(prompt.trim().slice(0, 60));
      if (data.music) {
        setSelectedMusicId(data.music.id);
      }
      setListRefreshKey((k) => k + 1);
      refetch();
    } catch {
      setError(t("music.error.generic"));
    } finally {
      setGenerating(false);
    }
  };

  const applyPreset = (presetKey: string) => {
    const presetPrompt = t(`music.preset.${presetKey}` as Parameters<typeof t>[0]);
    setPrompt(presetPrompt);
  };

  const handleSelectMusic = (music: { id: string; title: string; file_url: string; prompt: string; lyrics: string | null }) => {
    setSelectedMusicId(music.id);
    setAudioUrl(music.file_url);
    setPrompt(music.prompt);
    setLyrics(music.lyrics || "");
    setCurrentTitle(music.title || music.prompt.slice(0, 40));
  };

  const currentIndex = musicList.findIndex((m) => m.id === selectedMusicId);
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex >= 0 && currentIndex < musicList.length - 1;

  const handlePrevious = () => {
    if (hasPrevious) {
      handleSelectMusic(musicList[currentIndex - 1]);
    }
  };

  const handleNext = () => {
    if (hasNext) {
      handleSelectMusic(musicList[currentIndex + 1]);
    }
  };

  return (
    <section className="relative min-h-screen overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-violet-100/80 via-slate-50 to-blue-100/60 dark:from-violet-950/40 dark:via-zinc-950 dark:to-blue-950/30" />
        <svg className="absolute inset-0 w-full h-full opacity-[0.5] dark:opacity-[0.15]">
          <defs>
            <pattern id="dot-grid-music" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="0.8" className="fill-slate-500 dark:fill-zinc-400" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dot-grid-music)" />
        </svg>
        <motion.div
          className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-violet-400/40 dark:bg-violet-600/20 blur-3xl"
          animate={{ x: [0, 40, 0], y: [0, 30, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/3 -right-40 w-[420px] h-[420px] rounded-full bg-blue-400/35 dark:bg-blue-600/20 blur-3xl"
          animate={{ x: [0, -30, 0], y: [0, 40, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="flex min-h-screen">
        {/* Sidebar - Music List */}
        <div className={`${sidebarOpen ? "w-72 lg:w-80" : "w-0"} shrink-0 transition-all duration-300 overflow-hidden border-r border-gray-200/60 dark:border-zinc-800 bg-white/60 dark:bg-zinc-950/60 backdrop-blur-md`}>
          <div className="w-72 lg:w-80 h-screen sticky top-0">
            <MusicList
              onSelect={handleSelectMusic}
              selectedId={selectedMusicId}
              refreshKey={listRefreshKey}
              onListLoaded={handleMusicListLoaded}
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
        <div className={`flex-1 px-6 py-12 overflow-y-auto ${audioUrl ? "pb-28" : ""}`}>
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
                {t("music.back")}
              </button>

              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-violet-100 dark:bg-violet-900/30">
                  <MusicGenSvg className="w-6 h-6 text-violet-600 dark:text-violet-400" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                    {t("music.title")}
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-zinc-400 mt-0.5">
                    {t("music.subtitle")}
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
                  {t("music.credit_cost")}: <span className="font-semibold text-violet-600 dark:text-violet-400">{creditCost} {t("pricing.credits")}</span>
                </span>
                <span className="text-sm text-gray-600 dark:text-zinc-400">
                  {t("music.credits_remaining")}: <span className="font-semibold text-amber-600 dark:text-amber-400">{profile.credits}</span>
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
                <p className="text-sm font-medium text-amber-900 dark:text-amber-200">{t("music.error.plan_required")}</p>
              </motion.div>
            )}

            {/* Now Playing indicator */}
            {audioUrl && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.05 }}
                className="mb-6 flex items-center gap-3 rounded-xl border border-violet-200/60 dark:border-violet-800/40 bg-violet-50/50 dark:bg-violet-950/20 backdrop-blur-sm px-5 py-3"
              >
                <div className="flex items-end gap-[2px] h-3">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-[3px] rounded-full bg-violet-500 dark:bg-violet-400"
                      animate={{ height: [4, 12, 4] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                    />
                  ))}
                </div>
                <span className="text-sm font-medium text-violet-700 dark:text-violet-300">
                  {t("music.player.now_playing")}:
                </span>
                <span className="text-sm text-violet-600 dark:text-violet-400 truncate">
                  {currentTitle || prompt.slice(0, 40)}
                </span>
              </motion.div>
            )}

            {/* Genre Presets */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="mb-4"
            >
              <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">
                {t("music.presets")}
              </label>
              <div className="flex flex-wrap gap-2">
                {GENRE_PRESETS.map((preset) => (
                  <button
                    key={preset.key}
                    onClick={() => applyPreset(preset.key)}
                    disabled={isFree}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-gray-200/60 dark:border-zinc-700 bg-white/70 dark:bg-zinc-800/60 text-gray-700 dark:text-zinc-300 hover:bg-violet-50 dark:hover:bg-violet-900/20 hover:border-violet-300 dark:hover:border-violet-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span>{preset.emoji}</span>
                    {t(`music.genre.${preset.key}` as Parameters<typeof t>[0])}
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Prompt Input */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
              className="mb-4"
            >
              <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">
                {t("music.prompt_label")} <span className="text-red-500">*</span>
              </label>
              <textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                disabled={isFree || generating}
                placeholder={t("music.prompt_placeholder")}
                rows={3}
                className="w-full rounded-xl border border-gray-200/60 dark:border-zinc-700 bg-white/80 dark:bg-zinc-900/70 backdrop-blur-sm px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 dark:focus:ring-violet-400/50 focus:border-violet-400 dark:focus:border-violet-600 transition-all resize-none disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </motion.div>

            {/* Lyrics Input */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="mb-6"
            >
              <label htmlFor="lyrics" className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">
                {t("music.lyrics_label")} <span className="text-gray-400 dark:text-zinc-500 font-normal">({t("music.optional")})</span>
              </label>
              <textarea
                id="lyrics"
                value={lyrics}
                onChange={(e) => setLyrics(e.target.value)}
                disabled={isFree || generating}
                placeholder={t("music.lyrics_placeholder")}
                rows={8}
                className="w-full rounded-xl border border-gray-200/60 dark:border-zinc-700 bg-white/80 dark:bg-zinc-900/70 backdrop-blur-sm px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 dark:focus:ring-violet-400/50 focus:border-violet-400 dark:focus:border-violet-600 transition-all resize-none disabled:opacity-50 disabled:cursor-not-allowed font-mono"
              />
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
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-violet-600 dark:bg-violet-500 text-white font-semibold py-3.5 px-6 hover:bg-violet-700 dark:hover:bg-violet-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {generating ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    {t("music.generating")}
                  </>
                ) : (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                    {t("music.generate")} ({creditCost} {t("pricing.credits")})
                  </>
                )}
              </button>
              {!hasEnoughCredits && !isFree && (
                <p className="text-xs text-red-500 dark:text-red-400 mt-2 text-center">
                  {t("music.error.no_credits")}
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

            {/* Generating animation — morph style */}
            {generating && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-2xl border border-gray-200/60 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/70 backdrop-blur-sm p-10 flex flex-col items-center"
              >
                <div className="relative w-24 h-24 mb-6">
                  <div className="absolute inset-0 flex items-center justify-center">
                    {[0, 1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="absolute w-4 h-4 bg-violet-500 dark:bg-violet-400"
                        style={{
                          animation: `morph-${i} 2s infinite ease-in-out`,
                          animationDelay: `${i * 0.2}s`,
                        }}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-sm font-medium text-gray-700 dark:text-zinc-300">{t("music.generating_desc")}</p>
                <p className="text-xs text-gray-400 dark:text-zinc-500 mt-1">{t("music.generating_time")}</p>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Music Player */}
      <MusicPlayer
        audioUrl={audioUrl}
        title={currentTitle}
        prompt={prompt}
        onPrevious={handlePrevious}
        onNext={handleNext}
        hasPrevious={hasPrevious}
        hasNext={hasNext}
      />
    </section>
  );
}
