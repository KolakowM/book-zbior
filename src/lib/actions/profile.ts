"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function setReadingGoal(goal: number) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Musisz być zalogowany.");

  const safe = Number.isFinite(goal) && goal > 0 ? Math.floor(goal) : null;
  const { error } = await supabase
    .from("profiles")
    .update({ reading_goal: safe })
    .eq("id", user.id);
  if (error) throw error;
  revalidatePath("/wyzwania");
}

// Edycja własnego profilu.
export async function updateProfile(patch: {
  display_name?: string | null;
  city?: string | null;
  bio?: string | null;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Musisz być zalogowany.");
  const { error } = await supabase.from("profiles").update(patch).eq("id", user.id);
  if (error) throw error;
  revalidatePath("/profil");
}

// Obserwowanie / przestań obserwować.
export async function followUser(targetId: string) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Musisz być zalogowany.");
  if (user.id === targetId) return;
  const { error } = await supabase
    .from("follows")
    .insert({ follower_id: user.id, following_id: targetId });
  if (error) throw error;
}

export async function unfollowUser(targetId: string) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Musisz być zalogowany.");
  const { error } = await supabase
    .from("follows")
    .delete()
    .eq("follower_id", user.id)
    .eq("following_id", targetId);
  if (error) throw error;
}

// Walidacja i dostępność nazwy użytkownika.
const USERNAME_RE = /^[a-z0-9_]{3,20}$/;

export async function checkUsername(username: string): Promise<{ available: boolean; reason?: string }> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { available: false, reason: "Nie jesteś zalogowany." };

  const u = username.trim().toLowerCase();
  if (!USERNAME_RE.test(u)) {
    return { available: false, reason: "3–20 znaków: małe litery, cyfry, podkreślnik." };
  }

  const { data: taken } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", u)
    .neq("id", user.id)
    .maybeSingle();

  if (taken) return { available: false, reason: "Ta nazwa jest już zajęta." };
  return { available: true };
}

export async function updateUsername(username: string): Promise<{ ok: boolean; reason?: string }> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, reason: "Nie jesteś zalogowany." };

  const u = username.trim().toLowerCase();
  if (!USERNAME_RE.test(u)) {
    return { ok: false, reason: "3–20 znaków: małe litery, cyfry, podkreślnik." };
  }

  const { error } = await supabase.from("profiles").update({ username: u }).eq("id", user.id);
  if (error) {
    // 23505 = naruszenie unikalności
    if ((error as any).code === "23505") return { ok: false, reason: "Ta nazwa jest już zajęta." };
    return { ok: false, reason: "Nie udało się zapisać nazwy." };
  }
  revalidatePath("/profil");
  return { ok: true };
}
