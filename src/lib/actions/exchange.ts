"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// Wyślij propozycję wymiany do oferty z giełdy.
export async function proposeExchange(listingId: string) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Musisz być zalogowany.");

  const { data: existing } = await supabase
    .from("exchange_proposals")
    .select("id")
    .eq("listing_id", listingId)
    .eq("requester_id", user.id)
    .eq("status", "pending")
    .maybeSingle();
  if (existing) return { already: true };

  const { error } = await supabase
    .from("exchange_proposals")
    .insert({ listing_id: listingId, requester_id: user.id, status: "pending" });
  if (error) throw error;
  revalidatePath("/wymiany");
  return { already: false };
}

// Zmiana statusu propozycji (właściciel: accepted/rejected/completed; proszący: cancelled).
export async function updateProposal(
  id: string,
  status: "accepted" | "rejected" | "cancelled" | "completed"
) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Musisz być zalogowany.");

  const { error } = await supabase
    .from("exchange_proposals")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
  revalidatePath("/wymiany");
}
