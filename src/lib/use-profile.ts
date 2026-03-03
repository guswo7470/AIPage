"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth-context";

export interface UserProfile {
  plan: "free" | "pro" | "ultra";
  credits: number;
  subscription_status: "active" | "canceled" | "inactive";
  selected_service: string | null;
  pending_plan: string | null;
}

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }
    const supabase = createClient();
    const { data } = await supabase
      .from("users")
      .select("plan, credits, subscription_status, selected_service, pending_plan")
      .eq("id", user.id)
      .single();

    if (data) {
      setProfile(data as UserProfile);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    setLoading(true);
    fetchProfile();
  }, [fetchProfile]);

  // Re-fetch on window focus (user returns from Polar checkout tab)
  useEffect(() => {
    const onFocus = () => fetchProfile();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [fetchProfile]);

  return { profile, loading, refetch: fetchProfile };
}
