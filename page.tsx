import { createClient } from "@/lib/supabase/server";
import LibraryView from "@/components/LibraryView";
import type { LibraryItem } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function BibliotekaPage() {
  const supabase = createClient();

  // RLS automatycznie ogranicza wynik do zalogowanego użytkownika.
  const { data, error } = await supabase
    .from("user_library")
    .select("*, book:book_catalog(*)")
    .order("added_at", { ascending: false });

  if (error) {
    return (
      <div style={{ padding: 40, fontFamily: "var(--font-body)" }}>
        Nie udało się wczytać biblioteki: {error.message}
      </div>
    );
  }

  return <LibraryView items={(data as LibraryItem[]) ?? []} />;
}
