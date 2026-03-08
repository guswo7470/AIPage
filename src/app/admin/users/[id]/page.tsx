"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useLanguage } from "@/lib/language-context";
import { UserEditModal } from "@/components/admin/UserEditModal";

interface UserDetail {
  id: string;
  email: string;
  name: string;
  avatar_url: string;
  plan: string;
  subscription_status: string;
  credits: number;
  pending_plan: string | null;
  created_at: string;
  updated_at: string;
}

interface HistoryItem {
  id: string;
  title: string;
  service: string;
  credits_used: number;
  created_at: string;
}

const SERVICE_LABELS: Record<string, { ko: string; en: string }> = {
  images: { ko: "이미지", en: "Image" },
  videos: { ko: "영상", en: "Video" },
  musics: { ko: "음악", en: "Music" },
  documents: { ko: "문서", en: "Document" },
  codes: { ko: "코드", en: "Code" },
  fortunes: { ko: "사주", en: "Fortune" },
  calories: { ko: "칼로리", en: "Calorie" },
  math_solutions: { ko: "수학", en: "Math" },
  writings: { ko: "글쓰기", en: "Writing" },
};

const SERVICE_COLORS: Record<string, string> = {
  images: "bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-400",
  videos: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400",
  musics: "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400",
  documents: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
  codes: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400",
  fortunes: "bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400",
  calories: "bg-lime-100 dark:bg-lime-900/30 text-lime-700 dark:text-lime-400",
  math_solutions: "bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400",
  writings: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400",
};

export default function AdminUserDetailPage() {
  const { t, lang } = useLanguage();
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;

  const [user, setUser] = useState<UserDetail | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEdit, setShowEdit] = useState(false);

  const fetchData = async () => {
    const [userRes, historyRes] = await Promise.all([
      fetch(`/api/admin/users/${userId}`),
      fetch(`/api/admin/users/${userId}/history`),
    ]);
    const userData = await userRes.json();
    const historyData = await historyRes.json();
    setUser(userData.user);
    setHistory(historyData.history || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [userId]);

  const handleSave = async (updates: { credits?: number; plan?: string }) => {
    await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    setShowEdit(false);
    fetchData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 dark:text-zinc-500">
        {t("admin.common.loading")}
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="space-y-6">
      {/* Back button */}
      <button
        onClick={() => router.push("/admin/users")}
        className="flex items-center gap-2 text-sm text-gray-500 dark:text-zinc-400 hover:text-gray-700 dark:hover:text-zinc-200 transition-colors"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="19" y1="12" x2="5" y2="12" />
          <polyline points="12 19 5 12 12 5" />
        </svg>
        {t("admin.users.title")}
      </button>

      {/* Profile card */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            {user.avatar_url && (
              <img src={user.avatar_url} alt="" width={56} height={56} className="rounded-full" referrerPolicy="no-referrer" />
            )}
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{user.name || user.email}</h2>
              <p className="text-sm text-gray-500 dark:text-zinc-400">{user.email}</p>
            </div>
          </div>
          <button
            onClick={() => setShowEdit(true)}
            className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            {t("admin.users.edit")}
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
          <div>
            <p className="text-xs text-gray-500 dark:text-zinc-500 mb-1">{t("admin.users.plan")}</p>
            <p className="font-semibold text-gray-900 dark:text-white">{user.plan.charAt(0).toUpperCase() + user.plan.slice(1)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-zinc-500 mb-1">{t("admin.users.status")}</p>
            <p className="font-semibold text-gray-900 dark:text-white">{user.subscription_status}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-zinc-500 mb-1">{t("admin.users.credits")}</p>
            <p className="font-semibold font-mono text-gray-900 dark:text-white">{user.credits}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-zinc-500 mb-1">{t("admin.users.joined")}</p>
            <p className="font-semibold text-gray-900 dark:text-white">{new Date(user.created_at).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      {/* History */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          {t("admin.users.history")} ({history.length})
        </h3>

        {history.length === 0 ? (
          <p className="text-sm text-gray-400 dark:text-zinc-500 py-8 text-center">
            {t("admin.users.no_history")}
          </p>
        ) : (
          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {history.map((item) => (
              <div
                key={`${item.service}-${item.id}`}
                className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${SERVICE_COLORS[item.service] || ""}`}>
                    {SERVICE_LABELS[item.service]?.[lang] || item.service}
                  </span>
                  <span className="text-sm text-gray-700 dark:text-zinc-300 truncate max-w-[300px]">
                    {item.title || "Untitled"}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-zinc-400 shrink-0">
                  <span className="font-mono">{item.credits_used} cr</span>
                  <span>{new Date(item.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit modal */}
      {showEdit && (
        <UserEditModal
          user={user}
          onClose={() => setShowEdit(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
