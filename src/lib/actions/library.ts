"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { COVER_COLORS } from "@/lib/statuses";
import type { ReadingStatus } from "@/lib/types";

// Dodaje książkę: najpierw wpis w globalnym katalogu, potem w prywatnej
// bibliotece użytkownika. RLS pilnuje, że user_id = zalogowany użytkownik.
export async function addBook(formData: FormData) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Musisz być zalogowany.");

  const title = String(formData.get("title") || "").trim();
  const author = String(formData.get("author") || "").trim() || "Autor nieznany";
  const status = (String(formData.get("status") || "want_to_read")) as ReadingStatus;
  if (!title) throw new Error("Tytuł jest wymagany.");

  const color = COVER_COLORS[Math.floor(Math.random() * COVER_COLORS.length)];

  // Uwaga: deduplikację katalogu rozwiążemy później — na razie nowy wpis.
  const { data: book, error: bookErr } = await supabase
    .from("book_catalog")
    .insert({ title, author, cover_color: color, created_by: user.id })
    .select("id")
    .single();
  if (bookErr) throw bookErr;

  const { error: libErr } = await supabase.from("user_library").insert({
    user_id: user.id,
    book_id: book.id,
    reading_status: status,
  });
  if (libErr) throw libErr;

  revalidatePath("/biblioteka");
}

export async function removeBook(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("user_library").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/biblioteka");
}

export async function updateStatus(id: string, status: ReadingStatus) {
  const supabase = createClient();
  const { error } = await supabase
    .from("user_library")
    .update({ reading_status: status })
    .eq("id", id);
  if (error) throw error;
  revalidatePath("/biblioteka");
}
