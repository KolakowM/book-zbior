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
