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

  const isbn13 = String(formData.get("isbn13") || "").trim() || null;
  const isbn10 = String(formData.get("isbn10") || "").trim() || null;
  const coverUrl = String(formData.get("coverUrl") || "").trim() || null;
  const publisher = String(formData.get("publisher") || "").trim() || null;
  const yearNum = parseInt(String(formData.get("year") || ""), 10);
  const pagesNum = parseInt(String(formData.get("pages") || ""), 10);
  const year = Number.isFinite(yearNum) ? yearNum : null;
  const pages = Number.isFinite(pagesNum) ? pagesNum : null;

  const color = COVER_COLORS[Math.floor(Math.random() * COVER_COLORS.length)];

  // Uwaga: deduplikację katalogu rozwiążemy później — na razie nowy wpis.
  const { data: book, error: bookErr } = await supabase
    .from("book_catalog")
    .insert({
      title,
      author,
      isbn_13: isbn13,
      isbn_10: isbn10,
      cover_image_url: coverUrl,
      cover_color: color,
      publisher,
      publication_year: year,
      page_count: pages,
      created_by: user.id,
    })
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

// ─── Karta książki: ocena, recenzja, wymiana ───────────────────────

export async function updateRating(id: string, rating: number) {
  const supabase = createClient();
  const { error } = await supabase
    .from("user_library")
    .update({ user_rating: rating || null })
    .eq("id", id);
  if (error) throw error;
  revalidatePath("/biblioteka");
}

// Recenzja publiczna wymaga oceny 1–5 (ograniczenie w bazie).
export async function saveReview(bookId: string, body: string, rating: number) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Musisz być zalogowany.");
  if (rating < 1 || rating > 5) throw new Error("Najpierw oceń książkę.");

  const { error } = await supabase.from("reviews").upsert(
    {
      user_id: user.id,
      book_id: bookId,
      body: body.trim() || null,
      rating,
      is_public: true,
    },
    { onConflict: "user_id,book_id" }
  );
  if (error) throw error;
  revalidatePath("/biblioteka");
}

// Włącza/wyłącza dostępność egzemplarza do wymiany (tabela listings).
export async function toggleSwap(userLibraryId: string, on: boolean) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Musisz być zalogowany.");

  if (on) {
    const { error } = await supabase.from("listings").insert({
      user_id: user.id,
      user_library_id: userLibraryId,
      status: "active",
    });
    if (error) throw error;
    await supabase
      .from("user_library")
      .update({ physical_state: "on_exchange" })
      .eq("id", userLibraryId);
  } else {
    const { error } = await supabase
      .from("listings")
      .delete()
      .eq("user_library_id", userLibraryId)
      .eq("user_id", user.id);
    if (error) throw error;
    await supabase
      .from("user_library")
      .update({ physical_state: "in_library" })
      .eq("id", userLibraryId);
  }
  revalidatePath("/biblioteka");
}

// Dociąga dane karty, których nie ma w podstawowym zapytaniu półki.
export async function getBookExtras(userLibraryId: string, bookId: string) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { reviewBody: "", forExchange: false };

  const { data: review } = await supabase
    .from("reviews")
    .select("body")
    .eq("user_id", user.id)
    .eq("book_id", bookId)
    .maybeSingle();

  const { data: listing } = await supabase
    .from("listings")
    .select("id")
    .eq("user_library_id", userLibraryId)
    .eq("status", "active")
    .maybeSingle();

  return { reviewBody: review?.body ?? "", forExchange: !!listing };
}
