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
