"use client";

import { useState } from "react";
import { useLanguage } from "@/lib/language-context";

interface UserEditModalProps {
  user: {
    id: string;
    email: string;
    name: string;
    credits: number;
    plan: string;
  };
  onClose: () => void;
  onSave: (updated: { credits?: number; plan?: string }) => void;
}

export function UserEditModal({ user, onClose, onSave }: UserEditModalProps) {
  const { t } = useLanguage();
  const [credits, setCredits] = useState(user.credits);
  const [plan, setPlan] = useState(user.plan);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const updates: { credits?: number; plan?: string } = {};
    if (credits !== user.credits) updates.credits = credits;
    if (plan !== user.plan) updates.plan = plan;
    onSave(updates);
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-xl w-full max-w-md mx-4 p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
          {t("admin.users.edit")}
        </h3>
        <p className="text-sm text-gray-500 dark:text-zinc-400 mb-6">
          {user.email}
        </p>

        {/* Credits */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1.5">
            {t("admin.users.edit_credits")}
          </label>
          <input
            type="number"
            value={credits}
            onChange={(e) => setCredits(parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        {/* Plan */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1.5">
            {t("admin.users.edit_plan")}
          </label>
          <select
            value={plan}
            onChange={(e) => setPlan(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="free">Free</option>
            <option value="pro">Pro</option>
            <option value="ultra">Ultra</option>
          </select>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-lg border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
          >
            {t("admin.users.cancel")}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {saving ? "..." : t("admin.users.save")}
          </button>
        </div>
      </div>
    </div>
  );
}
