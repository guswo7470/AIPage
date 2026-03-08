"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useLanguage } from "@/lib/language-context";
import { useAuth } from "@/lib/auth-context";
import { useProfile } from "@/lib/use-profile";
import { DocumentGenSvg } from "@/components/ui/service-icons";
import { DocumentList } from "@/components/ui/DocumentList";

const CREDIT_COST = 5;

const DOC_TYPES = [
  { value: "pdf", labelKey: "document.type.pdf" },
  { value: "excel", labelKey: "document.type.excel" },
  { value: "ppt", labelKey: "document.type.ppt" },
  { value: "word", labelKey: "document.type.word" },
] as const;

export default function DocumentPage() {
  const { t } = useLanguage();
  const { user, loading } = useAuth();
  const { profile, refetch } = useProfile();
  const router = useRouter();

  const [prompt, setPrompt] = useState("");
  const [documentType, setDocumentType] = useState("pdf");
  const [attachedFile, setAttachedFile] = useState<File | null>(null);

  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [listRefreshKey, setListRefreshKey] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentTitle, setCurrentTitle] = useState("");
  const [copied, setCopied] = useState(false);

  const plan = profile?.plan ?? "free";
  const isFree = plan === "free";
  const hasEnoughCredits = (profile?.credits ?? 0) >= CREDIT_COST;

  const handleDocListLoaded = useCallback(() => {}, []);

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

  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        resolve(dataUrl.split(",")[1]);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleGenerate = async () => {
    if (!prompt.trim() || generating) return;
    setError(null);
    setResult(null);
    setFileUrl(null);
    setGenerating(true);

    try {
      let fileBase64: string | undefined;
      let fileMimeType: string | undefined;

      if (attachedFile) {
        fileBase64 = await fileToBase64(attachedFile);
        fileMimeType = attachedFile.type;
      }

      const res = await fetch("/api/generate-document", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: prompt.trim(),
          documentType,
          title: prompt.trim().slice(0, 60),
          fileBase64,
          fileMimeType,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.error === "Insufficient credits") {
          setError(t("document.error.no_credits"));
        } else if (data.error === "Paid plan required") {
          setError(t("document.error.plan_required"));
        } else {
          setError(data.detail || data.error || t("document.error.generic"));
        }
        return;
      }

      setResult(data.result);
      setFileUrl(data.fileUrl || null);
      setCurrentTitle(prompt.trim().slice(0, 60));
      if (data.document) {
        setSelectedDocId(data.document.id);
      }
      setListRefreshKey((k) => k + 1);
      refetch();
    } catch {
      setError(t("document.error.generic"));
    } finally {
      setGenerating(false);
    }
  };

  const handleSelectDocument = async (doc: { id: string; title: string; prompt: string; document_type: string; file_url: string | null }) => {
    setSelectedDocId(doc.id);
    setCurrentTitle(doc.title);
    setPrompt(doc.prompt);
    setDocumentType(doc.document_type);
    setFileUrl(doc.file_url);

    try {
      const res = await fetch(`/api/documents?id=${doc.id}`);
      if (res.ok) {
        const data = await res.json();
        if (data.document?.result) {
          setResult(data.document.result);
          setFileUrl(data.document.file_url || null);
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

  const handleDownloadFile = () => {
    if (!fileUrl) return;
    const a = document.createElement("a");
    a.href = fileUrl;
    a.download = `${currentTitle || "document"}.${documentType === "excel" ? "xlsx" : documentType === "ppt" ? "pptx" : documentType === "word" ? "docx" : "pdf"}`;
    a.target = "_blank";
    a.click();
  };

  return (
    <section className="relative min-h-screen overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-100/80 via-slate-50 to-sky-100/60 dark:from-cyan-950/40 dark:via-zinc-950 dark:to-sky-950/30" />
        <svg className="absolute inset-0 w-full h-full opacity-[0.5] dark:opacity-[0.15]">
          <defs>
            <pattern id="dot-grid-document" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="0.8" className="fill-slate-500 dark:fill-zinc-400" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dot-grid-document)" />
        </svg>
        <motion.div
          className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-cyan-400/40 dark:bg-cyan-600/20 blur-3xl"
          animate={{ x: [0, 40, 0], y: [0, 30, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/3 -right-40 w-[420px] h-[420px] rounded-full bg-sky-400/35 dark:bg-sky-600/20 blur-3xl"
          animate={{ x: [0, -30, 0], y: [0, 40, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="flex min-h-screen">
        {/* Sidebar - Document List */}
        <div className={`${sidebarOpen ? "w-72 lg:w-80" : "w-0"} shrink-0 transition-all duration-300 overflow-hidden border-r border-gray-200/60 dark:border-zinc-800 bg-white/60 dark:bg-zinc-950/60 backdrop-blur-md`}>
          <div className="w-72 lg:w-80 h-screen sticky top-0">
            <DocumentList
              onSelect={handleSelectDocument}
              selectedId={selectedDocId}
              refreshKey={listRefreshKey}
              onListLoaded={handleDocListLoaded}
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
                {t("document.back")}
              </button>

              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-cyan-100 dark:bg-cyan-900/30">
                  <DocumentGenSvg className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                    {t("document.title")}
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-zinc-400 mt-0.5">
                    {t("document.subtitle")}
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
                  {t("document.credit_cost")}: <span className="font-semibold text-cyan-600 dark:text-cyan-400">{CREDIT_COST} {t("pricing.credits")}</span>
                </span>
                <span className="text-sm text-gray-600 dark:text-zinc-400">
                  {t("document.credits_remaining")}: <span className="font-semibold text-cyan-600 dark:text-cyan-400">{profile.credits}</span>
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
                <p className="text-sm font-medium text-amber-900 dark:text-amber-200">{t("document.error.plan_required")}</p>
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
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-cyan-100 dark:bg-cyan-900/30">
                      <DocumentGenSvg className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                        {t("document.result_title")}
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
                      {copied ? t("document.copied") : t("document.copy")}
                    </button>
                    {fileUrl && (
                      <button
                        onClick={handleDownloadFile}
                        className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-100 dark:hover:bg-cyan-900/40 transition-colors"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                          <polyline points="7 10 12 15 17 10" />
                          <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                        {t("document.download_file")}
                      </button>
                    )}
                  </div>
                </div>
                <div className="prose prose-sm dark:prose-invert max-w-none prose-headings:text-gray-900 dark:prose-headings:text-white prose-p:text-gray-700 dark:prose-p:text-zinc-300 prose-pre:bg-gray-900 dark:prose-pre:bg-zinc-950 prose-pre:text-gray-100">
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
              {/* Document Type Select */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">
                  {t("document.type_label")}
                </label>
                <div className="flex flex-wrap gap-2">
                  {DOC_TYPES.map((dt) => (
                    <button
                      key={dt.value}
                      onClick={() => setDocumentType(dt.value)}
                      disabled={isFree || generating}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                        documentType === dt.value
                          ? "bg-cyan-600 dark:bg-cyan-500 text-white border-cyan-600 dark:border-cyan-500"
                          : "border-gray-200/60 dark:border-zinc-700 bg-white/70 dark:bg-zinc-800/60 text-gray-700 dark:text-zinc-300 hover:bg-cyan-50 dark:hover:bg-cyan-900/20"
                      }`}
                    >
                      {t(dt.labelKey)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Prompt */}
              <div>
                <label htmlFor="documentPrompt" className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">
                  {t("document.prompt_label")} <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="documentPrompt"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={t("document.prompt_placeholder")}
                  rows={5}
                  disabled={isFree || generating}
                  className="w-full rounded-xl border border-gray-200/60 dark:border-zinc-700 bg-white/80 dark:bg-zinc-900/70 backdrop-blur-sm px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 dark:focus:ring-cyan-400/50 focus:border-cyan-400 dark:focus:border-cyan-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed resize-none"
                />
              </div>

              {/* File Attachment */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">
                  {t("document.attachment_label")} <span className="text-xs font-normal text-gray-400 dark:text-zinc-500">({t("document.attachment_optional")})</span>
                </label>
                {attachedFile ? (
                  <div className="flex items-center gap-3 rounded-xl border border-cyan-200/60 dark:border-cyan-800/40 bg-cyan-50/50 dark:bg-cyan-950/20 px-4 py-3">
                    <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-cyan-100 dark:bg-cyan-900/40 shrink-0">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-cyan-600 dark:text-cyan-400">
                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-800 dark:text-zinc-200 truncate">{attachedFile.name}</p>
                      <p className="text-[10px] text-gray-400 dark:text-zinc-500">{(attachedFile.size / 1024).toFixed(1)} KB</p>
                    </div>
                    <button
                      onClick={() => setAttachedFile(null)}
                      disabled={generating}
                      className="shrink-0 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors disabled:opacity-50"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-400 dark:text-red-500">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <label
                    className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200/60 dark:border-zinc-700 bg-white/50 dark:bg-zinc-900/40 px-4 py-5 cursor-pointer hover:border-cyan-400 dark:hover:border-cyan-600 hover:bg-cyan-50/30 dark:hover:bg-cyan-950/10 transition-all ${
                      isFree || generating ? "opacity-50 pointer-events-none" : ""
                    }`}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 dark:text-zinc-500">
                      <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
                    </svg>
                    <div className="text-center">
                      <p className="text-xs font-medium text-gray-500 dark:text-zinc-400">{t("document.attachment_click")}</p>
                      <p className="text-[10px] text-gray-300 dark:text-zinc-600 mt-0.5">{t("document.attachment_formats")}</p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf,.docx,.xlsx,.txt,.csv,.md"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          if (file.size > 10 * 1024 * 1024) {
                            setError(t("document.attachment_size_error"));
                            return;
                          }
                          setAttachedFile(file);
                          setError(null);
                        }
                      }}
                      disabled={isFree || generating}
                    />
                  </label>
                )}
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
                disabled={isFree || !prompt.trim() || generating || !hasEnoughCredits}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-cyan-600 dark:bg-cyan-500 text-white font-semibold py-3.5 px-6 hover:bg-cyan-700 dark:hover:bg-cyan-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {generating ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    {t("document.generating")}
                  </>
                ) : (
                  <>
                    <DocumentGenSvg className="w-5 h-5" />
                    {t("document.generate")} ({CREDIT_COST} {t("pricing.credits")})
                  </>
                )}
              </button>
              {!hasEnoughCredits && !isFree && (
                <p className="text-xs text-red-500 dark:text-red-400 mt-2 text-center">
                  {t("document.error.no_credits")}
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
                    <div className="w-20 h-20 rounded-full border-4 border-cyan-200 dark:border-cyan-800 border-t-cyan-600 dark:border-t-cyan-400 animate-spin" />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <DocumentGenSvg className="w-8 h-8 text-cyan-600 dark:text-cyan-400" />
                  </div>
                </div>
                <p className="text-sm font-medium text-gray-700 dark:text-zinc-300">{t("document.generating_desc")}</p>
                <p className="text-xs text-gray-400 dark:text-zinc-500 mt-1">{t("document.generating_time")}</p>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
