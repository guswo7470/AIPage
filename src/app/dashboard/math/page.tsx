"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useLanguage } from "@/lib/language-context";
import { useAuth } from "@/lib/auth-context";
import { useProfile } from "@/lib/use-profile";
import { MathGenSvg } from "@/components/ui/service-icons";
import { MathList } from "@/components/ui/MathList";

const CREDIT_COST = 5;

export default function MathPage() {
  const { t } = useLanguage();
  const { user, loading } = useAuth();
  const { profile, refetch } = useProfile();
  const router = useRouter();

  // Input mode: "text" or "image"
  const [inputMode, setInputMode] = useState<"text" | "image">("text");
  const [problemText, setProblemText] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const [solving, setSolving] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [resultImageUrl, setResultImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedSolutionId, setSelectedSolutionId] = useState<string | null>(null);
  const [listRefreshKey, setListRefreshKey] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentTitle, setCurrentTitle] = useState("");
  const [copied, setCopied] = useState(false);

  const plan = profile?.plan ?? "free";
  const isFree = plan === "free";
  const hasEnoughCredits = (profile?.credits ?? 0) >= CREDIT_COST;

  const handleMathListLoaded = useCallback(() => {}, []);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  // Cleanup object URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900 dark:border-zinc-600 dark:border-t-white" />
      </div>
    );
  }

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError(t("math.error.invalid_file"));
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError(t("math.error.file_too_large"));
      return;
    }
    setSelectedFile(file);
    setError(null);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const canSubmit = inputMode === "text" ? problemText.trim().length > 0 : selectedFile !== null;

  const handleSolve = async () => {
    if (!canSubmit || solving) return;
    setError(null);
    setResult(null);
    setSolving(true);

    try {
      const body: Record<string, string> = {};

      if (inputMode === "text") {
        body.problemText = problemText.trim();
        body.title = problemText.trim().slice(0, 60);
      } else if (selectedFile) {
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const dataUrl = reader.result as string;
            resolve(dataUrl.split(",")[1]);
          };
          reader.onerror = reject;
          reader.readAsDataURL(selectedFile);
        });
        body.imageBase64 = base64;
        body.mimeType = selectedFile.type;
        body.title = selectedFile.name.replace(/\.[^.]+$/, "").slice(0, 60);
      }

      const res = await fetch("/api/generate-math", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.error === "Insufficient credits") {
          setError(t("math.error.no_credits"));
        } else if (data.error === "Paid plan required") {
          setError(t("math.error.plan_required"));
        } else {
          setError(data.detail || data.error || t("math.error.generic"));
        }
        return;
      }

      setResult(data.result);
      setResultImageUrl(data.imageUrl || null);
      setCurrentTitle(data.mathSolution?.title || "");
      if (data.mathSolution) {
        setSelectedSolutionId(data.mathSolution.id);
      }
      setListRefreshKey((k) => k + 1);
      refetch();
    } catch {
      setError(t("math.error.generic"));
    } finally {
      setSolving(false);
    }
  };

  const handleSelectSolution = async (item: { id: string; title: string; input_type: string; image_url: string | null }) => {
    setSelectedSolutionId(item.id);
    setCurrentTitle(item.title);
    setResultImageUrl(item.image_url);
    setSelectedFile(null);
    setPreviewUrl(null);

    try {
      const res = await fetch(`/api/math-solutions?id=${item.id}`);
      if (res.ok) {
        const data = await res.json();
        if (data.mathSolution?.result) {
          setResult(data.mathSolution.result);
        }
        if (data.mathSolution?.problem_text) {
          setProblemText(data.mathSolution.problem_text);
          setInputMode("text");
        } else {
          setInputMode("image");
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
    a.download = `${currentTitle || "math-solution"}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="relative min-h-screen overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-red-100/80 via-slate-50 to-rose-100/60 dark:from-red-950/40 dark:via-zinc-950 dark:to-rose-950/30" />
        <svg className="absolute inset-0 w-full h-full opacity-[0.5] dark:opacity-[0.15]">
          <defs>
            <pattern id="dot-grid-math" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="0.8" className="fill-slate-500 dark:fill-zinc-400" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dot-grid-math)" />
        </svg>
        <motion.div
          className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-red-400/40 dark:bg-red-600/20 blur-3xl"
          animate={{ x: [0, 40, 0], y: [0, 30, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/3 -right-40 w-[420px] h-[420px] rounded-full bg-rose-400/35 dark:bg-rose-600/20 blur-3xl"
          animate={{ x: [0, -30, 0], y: [0, 40, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="flex min-h-screen">
        {/* Sidebar */}
        <div className={`${sidebarOpen ? "w-72 lg:w-80" : "w-0"} shrink-0 transition-all duration-300 overflow-hidden border-r border-gray-200/60 dark:border-zinc-800 bg-white/60 dark:bg-zinc-950/60 backdrop-blur-md`}>
          <div className="w-72 lg:w-80 h-screen sticky top-0">
            <MathList
              onSelect={handleSelectSolution}
              selectedId={selectedSolutionId}
              refreshKey={listRefreshKey}
              onListLoaded={handleMathListLoaded}
            />
          </div>
        </div>

        {/* Sidebar Toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="sticky top-4 z-10 -ml-3 mt-4 flex items-center justify-center w-6 h-12 rounded-r-lg bg-white/80 dark:bg-zinc-900/80 border border-l-0 border-gray-200/60 dark:border-zinc-800 backdrop-blur-sm hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
        >
          <svg
            width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
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
                {t("math.back")}
              </button>

              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-red-100 dark:bg-red-900/30">
                  <MathGenSvg className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                    {t("math.title")}
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-zinc-400 mt-0.5">
                    {t("math.subtitle")}
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
                  {t("math.credit_cost")}: <span className="font-semibold text-red-600 dark:text-red-400">{CREDIT_COST} {t("pricing.credits")}</span>
                </span>
                <span className="text-sm text-gray-600 dark:text-zinc-400">
                  {t("math.credits_remaining")}: <span className="font-semibold text-red-600 dark:text-red-400">{profile.credits}</span>
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
                <p className="text-sm font-medium text-amber-900 dark:text-amber-200">{t("math.error.plan_required")}</p>
              </motion.div>
            )}

            {/* Result Preview */}
            {result && !solving && (
              <motion.div
                initial={{ opacity: 0, y: 16, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="mb-6 rounded-2xl border border-gray-200/60 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/70 backdrop-blur-sm p-4 md:p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30">
                      <MathGenSvg className="w-4 h-4 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                        {t("math.result_title")}
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
                      {copied ? t("math.copied") : t("math.copy")}
                    </button>
                    <button
                      onClick={handleDownload}
                      className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                      {t("math.download")}
                    </button>
                  </div>
                </div>

                {/* Problem image in result */}
                {resultImageUrl && (
                  <div className="mb-4 rounded-xl overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={resultImageUrl} alt="Math problem" className="w-full max-h-48 object-contain bg-gray-50 dark:bg-zinc-800" />
                  </div>
                )}

                <div className="prose prose-sm dark:prose-invert max-w-none prose-headings:text-gray-900 dark:prose-headings:text-white prose-p:text-gray-700 dark:prose-p:text-zinc-300 prose-table:text-sm prose-pre:bg-gray-900 dark:prose-pre:bg-zinc-950 prose-pre:text-gray-100">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{result}</ReactMarkdown>
                </div>
              </motion.div>
            )}

            {/* Input Mode Tabs */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="mb-4"
            >
              <div className="flex gap-1 p-1 rounded-xl bg-gray-100/80 dark:bg-zinc-800/60 backdrop-blur-sm w-fit">
                <button
                  onClick={() => setInputMode("text")}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                    inputMode === "text"
                      ? "bg-white dark:bg-zinc-700 text-red-600 dark:text-red-400 shadow-sm"
                      : "text-gray-500 dark:text-zinc-400 hover:text-gray-700 dark:hover:text-zinc-300"
                  }`}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 3a2.85 2.85 0 114 4L7.5 20.5 2 22l1.5-5.5z" />
                  </svg>
                  {t("math.tab.text")}
                </button>
                <button
                  onClick={() => setInputMode("image")}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                    inputMode === "image"
                      ? "bg-white dark:bg-zinc-700 text-red-600 dark:text-red-400 shadow-sm"
                      : "text-gray-500 dark:text-zinc-400 hover:text-gray-700 dark:hover:text-zinc-300"
                  }`}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                  {t("math.tab.image")}
                </button>
              </div>
            </motion.div>

            {/* Text Input */}
            {inputMode === "text" && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="mb-4"
              >
                <label htmlFor="mathPrompt" className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">
                  {t("math.prompt_label")} <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="mathPrompt"
                  value={problemText}
                  onChange={(e) => setProblemText(e.target.value)}
                  placeholder={t("math.prompt_placeholder")}
                  rows={5}
                  disabled={isFree || solving}
                  className="w-full rounded-xl border border-gray-200/60 dark:border-zinc-700 bg-white/80 dark:bg-zinc-900/70 backdrop-blur-sm px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 dark:focus:ring-red-400/50 focus:border-red-400 dark:focus:border-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed resize-none"
                />
              </motion.div>
            )}

            {/* Image Upload */}
            {inputMode === "image" && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="mb-4"
              >
                <div
                  onDragOver={(e) => { e.preventDefault(); if (!isFree && !solving) setIsDragOver(true); }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragOver(false);
                    if (isFree || solving) return;
                    const file = e.dataTransfer.files[0];
                    if (file) handleFileSelect(file);
                  }}
                  onClick={() => !isFree && !solving && document.getElementById("mathFileInput")?.click()}
                  className={`relative rounded-xl border-2 border-dashed transition-all ${
                    isDragOver
                      ? "border-red-400 bg-red-50/60 dark:border-red-600 dark:bg-red-950/20"
                      : previewUrl
                        ? "border-red-300 dark:border-red-700"
                        : "border-gray-200/80 dark:border-zinc-700 hover:border-red-300 dark:hover:border-red-700"
                  } ${isFree || solving ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                >
                  {previewUrl ? (
                    <div className="relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-full max-h-72 object-contain rounded-xl"
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFile(null);
                          if (previewUrl.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
                          setPreviewUrl(null);
                          setResult(null);
                        }}
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                      {selectedFile && (
                        <p className="text-xs text-center text-gray-500 dark:text-zinc-400 py-2">
                          {selectedFile.name} ({(selectedFile.size / 1024).toFixed(0)} KB)
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-red-400 dark:text-red-600 mb-3">
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                      </svg>
                      <p className="text-sm font-medium text-gray-700 dark:text-zinc-300">
                        {t("math.upload_drag")}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-zinc-500 mt-1">
                        {t("math.upload_hint")}
                      </p>
                      <span className="mt-4 text-xs font-medium px-4 py-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800">
                        {t("math.upload_button")}
                      </span>
                    </div>
                  )}
                </div>

                <input
                  id="mathFileInput"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  disabled={isFree || solving}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileSelect(file);
                    e.target.value = "";
                  }}
                />
              </motion.div>
            )}

            {/* Solve Button */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.25 }}
              className="mb-8"
            >
              <button
                onClick={handleSolve}
                disabled={isFree || !canSubmit || solving || !hasEnoughCredits}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-red-600 dark:bg-red-500 text-white font-semibold py-3.5 px-6 hover:bg-red-700 dark:hover:bg-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {solving ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    {t("math.solving")}
                  </>
                ) : (
                  <>
                    <MathGenSvg className="w-5 h-5" />
                    {t("math.solve")} ({CREDIT_COST} {t("pricing.credits")})
                  </>
                )}
              </button>
              {!hasEnoughCredits && !isFree && (
                <p className="text-xs text-red-500 dark:text-red-400 mt-2 text-center">
                  {t("math.error.no_credits")}
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

            {/* Solving animation */}
            {solving && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-2xl border border-gray-200/60 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/70 backdrop-blur-sm p-10 flex flex-col items-center"
              >
                <div className="relative w-24 h-24 mb-6">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-20 h-20 rounded-full border-4 border-red-200 dark:border-red-800 border-t-red-600 dark:border-t-red-400 animate-spin" />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <MathGenSvg className="w-8 h-8 text-red-600 dark:text-red-400" />
                  </div>
                </div>
                <p className="text-sm font-medium text-gray-700 dark:text-zinc-300">{t("math.solving_desc")}</p>
                <p className="text-xs text-gray-400 dark:text-zinc-500 mt-1">{t("math.solving_time")}</p>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
