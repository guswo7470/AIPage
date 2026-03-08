"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/language-context";
import { DataTable, type Column } from "@/components/admin/DataTable";

interface User {
  id: string;
  email: string;
  name: string;
  avatar_url: string;
  plan: string;
  subscription_status: string;
  credits: number;
  created_at: string;
}

const PLAN_COLORS: Record<string, string> = {
  free: "bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400",
  pro: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
  ultra: "bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400",
};

const STATUS_COLORS: Record<string, string> = {
  active: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400",
  inactive: "bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400",
  canceled: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400",
};

export default function AdminUsersPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (planFilter) params.set("plan", planFilter);
    if (statusFilter) params.set("status", statusFilter);
    params.set("page", String(page));
    params.set("limit", "20");

    const res = await fetch(`/api/admin/users?${params}`);
    const data = await res.json();
    setUsers(data.users || []);
    setTotalCount(data.totalCount || 0);
    setLoading(false);
  }, [search, planFilter, statusFilter, page]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const columns: Column<User>[] = [
    {
      key: "email",
      label: t("admin.users.email"),
      render: (row) => (
        <div className="flex items-center gap-2">
          {row.avatar_url && (
            <img src={row.avatar_url} alt="" width={24} height={24} className="rounded-full" referrerPolicy="no-referrer" />
          )}
          <span className="truncate max-w-[200px]">{row.email}</span>
        </div>
      ),
    },
    { key: "name", label: t("admin.users.name") },
    {
      key: "plan",
      label: t("admin.users.plan"),
      render: (row) => (
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${PLAN_COLORS[row.plan] || ""}`}>
          {row.plan.charAt(0).toUpperCase() + row.plan.slice(1)}
        </span>
      ),
    },
    {
      key: "subscription_status",
      label: t("admin.users.status"),
      render: (row) => (
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[row.subscription_status] || ""}`}>
          {row.subscription_status}
        </span>
      ),
    },
    {
      key: "credits",
      label: t("admin.users.credits"),
      render: (row) => <span className="font-mono">{row.credits}</span>,
    },
    {
      key: "created_at",
      label: t("admin.users.joined"),
      render: (row) => {
        const d = new Date(row.created_at);
        return `${d.getFullYear()}.${d.getMonth() + 1}.${d.getDate()} ${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
      },
    },
  ];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        {t("admin.users.title")}
      </h1>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="text"
          placeholder={t("admin.users.search")}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm text-gray-900 dark:text-white w-64 focus:ring-2 focus:ring-blue-500 outline-none"
        />
        <select
          value={planFilter}
          onChange={(e) => {
            setPlanFilter(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
        >
          <option value="">{t("admin.users.all_plans")}</option>
          <option value="free">Free</option>
          <option value="pro">Pro</option>
          <option value="ultra">Ultra</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
        >
          <option value="">{t("admin.users.all_status")}</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="canceled">Canceled</option>
        </select>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800">
        <DataTable
          columns={columns}
          data={users}
          totalCount={totalCount}
          page={page}
          limit={20}
          onPageChange={setPage}
          loading={loading}
          onRowClick={(row) => router.push(`/admin/users/${row.id}`)}
        />
      </div>
    </div>
  );
}
