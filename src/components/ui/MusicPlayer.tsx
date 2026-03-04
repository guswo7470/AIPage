"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/lib/language-context";

interface MusicPlayerProps {
  audioUrl: string | null;
  title: string;
  prompt: string;
  onPrevious?: () => void;
  onNext?: () => void;
  hasPrevious?: boolean;
  hasNext?: boolean;
}

export function MusicPlayer({
  audioUrl,
  title,
  prompt,
  onPrevious,
  onNext,
  hasPrevious = false,
  hasNext = false,
}: MusicPlayerProps) {
  const { t } = useLanguage();
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showVolume, setShowVolume] = useState(false);

  // Reset when audio URL changes
  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  }, [audioUrl]);

  // Auto-play when new audio loads
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !audioUrl) return;

    const handleCanPlay = () => {
      audio.play().then(() => setIsPlaying(true)).catch(() => {});
    };

    audio.addEventListener("canplay", handleCanPlay, { once: true });
    return () => audio.removeEventListener("canplay", handleCanPlay);
  }, [audioUrl]);

  // Sync audio element with volume state
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  // Time update handler
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => {
      if (!isDragging) setCurrentTime(audio.currentTime);
    };
    const onDurationChange = () => setDuration(audio.duration || 0);
    const onEnded = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("durationchange", onDurationChange);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("durationchange", onDurationChange);
      audio.removeEventListener("ended", onEnded);
    };
  }, [isDragging]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  }, [isPlaying]);

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    const bar = progressRef.current;
    if (!audio || !bar || !duration) return;

    const rect = bar.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    audio.currentTime = ratio * duration;
    setCurrentTime(ratio * duration);
  };

  const handleProgressDrag = useCallback(
    (e: MouseEvent) => {
      const audio = audioRef.current;
      const bar = progressRef.current;
      if (!audio || !bar || !duration) return;

      const rect = bar.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      audio.currentTime = ratio * duration;
      setCurrentTime(ratio * duration);
    },
    [duration]
  );

  const handleProgressDragEnd = useCallback(() => {
    setIsDragging(false);
    document.removeEventListener("mousemove", handleProgressDrag);
    document.removeEventListener("mouseup", handleProgressDragEnd);
  }, [handleProgressDrag]);

  const handleProgressDragStart = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    handleProgressClick(e);
    document.addEventListener("mousemove", handleProgressDrag);
    document.addEventListener("mouseup", handleProgressDragEnd);
  };

  const formatTime = (sec: number) => {
    if (!sec || !isFinite(sec)) return "0:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const handleDownload = async () => {
    if (!audioUrl) return;
    const res = await fetch(audioUrl);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title || "ai-music"}.mp3`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (!audioUrl) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200/60 dark:border-zinc-800 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-xl"
      >
        {/* Hidden audio element */}
        <audio ref={audioRef} src={audioUrl} preload="metadata" />

        {/* Top progress bar (thin, clickable) */}
        <div
          ref={progressRef}
          onMouseDown={handleProgressDragStart}
          className="group relative h-1 w-full cursor-pointer hover:h-1.5 transition-all"
        >
          <div className="absolute inset-0 bg-gray-200 dark:bg-zinc-800" />
          <div
            className="absolute left-0 top-0 h-full bg-violet-500 dark:bg-violet-400 transition-[width] duration-100"
            style={{ width: `${progress}%` }}
          />
          {/* Drag handle */}
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-violet-500 dark:bg-violet-400 opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
            style={{ left: `${progress}%` }}
          />
        </div>

        {/* Player content */}
        <div className="flex items-center h-[72px] px-4 md:px-6 gap-4">
          {/* Left: Track info */}
          <div className="flex items-center gap-3 min-w-0 w-[30%] md:w-[25%]">
            {/* Album art placeholder */}
            <div className="shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-violet-500 to-blue-500 dark:from-violet-600 dark:to-blue-600 flex items-center justify-center shadow-sm">
              {isPlaying ? (
                <div className="flex items-end gap-[2px] h-4">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-[3px] rounded-full bg-white"
                      animate={{ height: [4, 14, 4] }}
                      transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.12 }}
                    />
                  ))}
                </div>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 18V5l12-2v13" />
                  <circle cx="6" cy="18" r="3" />
                  <circle cx="18" cy="16" r="3" />
                </svg>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {title || "AI Music"}
              </p>
              <p className="text-xs text-gray-500 dark:text-zinc-400 truncate">
                {prompt.slice(0, 40)}{prompt.length > 40 ? "..." : ""}
              </p>
            </div>
          </div>

          {/* Center: Playback controls */}
          <div className="flex flex-col items-center flex-1 max-w-[500px]">
            <div className="flex items-center gap-3 md:gap-4">
              {/* Previous */}
              <button
                onClick={onPrevious}
                disabled={!hasPrevious}
                className="p-1.5 text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
                </svg>
              </button>

              {/* Play/Pause */}
              <button
                onClick={togglePlay}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-900 dark:bg-white hover:scale-105 active:scale-95 transition-transform"
              >
                {isPlaying ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="white" className="dark:fill-gray-900">
                    <rect x="6" y="4" width="4" height="16" rx="1" />
                    <rect x="14" y="4" width="4" height="16" rx="1" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="white" className="dark:fill-gray-900 ml-0.5">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                )}
              </button>

              {/* Next */}
              <button
                onClick={onNext}
                disabled={!hasNext}
                className="p-1.5 text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
                </svg>
              </button>
            </div>

            {/* Time display (under controls on md+) */}
            <div className="hidden md:flex items-center gap-2 text-[11px] text-gray-400 dark:text-zinc-500 mt-0.5">
              <span className="w-9 text-right tabular-nums">{formatTime(currentTime)}</span>
              <span>/</span>
              <span className="w-9 tabular-nums">{formatTime(duration)}</span>
            </div>
          </div>

          {/* Right: Volume + Download */}
          <div className="flex items-center justify-end gap-2 w-[30%] md:w-[25%]">
            {/* Volume */}
            <div
              className="relative hidden md:flex items-center gap-1.5"
              onMouseEnter={() => setShowVolume(true)}
              onMouseLeave={() => setShowVolume(false)}
            >
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="p-1.5 text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                {isMuted || volume === 0 ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                    <line x1="23" y1="9" x2="17" y2="15" />
                    <line x1="17" y1="9" x2="23" y2="15" />
                  </svg>
                ) : volume < 0.5 ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                  </svg>
                )}
              </button>
              <AnimatePresence>
                {showVolume && (
                  <motion.div
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 80, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="overflow-hidden"
                  >
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={isMuted ? 0 : volume}
                      onChange={(e) => {
                        const v = parseFloat(e.target.value);
                        setVolume(v);
                        if (v > 0) setIsMuted(false);
                      }}
                      className="w-full h-1 accent-violet-500 cursor-pointer"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Download */}
            <button
              onClick={handleDownload}
              className="p-2 text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              title={t("music.download")}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}