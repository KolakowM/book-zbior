import { createClient } from "@/lib/supabase/server";
import DashboardView from "@/components/DashboardView";
import type { LibraryItem } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function WyzwaniaPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data } = await supabase
    .from("user_library")
    .select("*, book:book_catalog(*)");
  const items = (data as LibraryItem[]) ?? [];

  // Cel czytelniczy (kolumna może jeszcze nie istnieć — wtedy domyślnie 25).
  let goal = 25;
  if (user) {
    const { data: prof, error } = await supabase
      .from("profiles")
      .select("reading_goal")
      .eq("id", user.id)
      .maybeSingle();
    if (!error && prof && (prof as any).reading_goal != null) {
      goal = (prof as any).reading_goal;
    }
  }

  const year = new Date().getFullYear();
  const read = items.filter((i) => i.reading_status === "read");
  const readThisYear = read.filter(
    (i) => i.read_date && new Date(i.read_date).getFullYear() === year
  );
  const pagesReadYear = readThisYear.reduce((s, i) => s + (i.book.page_count || 0), 0);
  const rated = items.filter((i) => i.user_rating);
  const avgRating = rated.length
    ? rated.reduce((s, i) => s + (i.user_rating || 0), 0) / rated.length
    : 0;
  const forExchange = items.filter((i) => i.physical_state === "on_exchange").length;

  const monthly = Array(12).fill(0) as number[];
  for (const i of items) {
    if (i.purchase_price && i.purchase_date) {
      const d = new Date(i.purchase_date);
      if (d.getFullYear() === year) monthly[d.getMonth()] += Number(i.purchase_price);
    }
  }
  const totalSpend = monthly.reduce((a, b) => a + b, 0);

  const authorCounts: Record<string, number> = {};
  for (const i of items) {
    const a = i.book.author || "—";
    authorCounts[a] = (authorCounts[a] || 0) + 1;
  }
  const topAuthors = Object.entries(authorCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([name, count]) => ({ name, count }));

  const statusCounts = {
    read: items.filter((i) => i.reading_status === "read").length,
    reading: items.filter((i) => i.reading_status === "reading").length,
    want_to_read: items.filter((i) => i.reading_status === "want_to_read").length,
    abandoned: items.filter((i) => i.reading_status === "abandoned").length,
  };

  const stats = {
    year,
    booksReadYear: readThisYear.length,
    pagesReadYear,
    totalBooks: items.length,
    avgRating: Math.round(avgRating * 10) / 10,
    forExchange,
    monthly,
    totalSpend: Math.round(totalSpend * 100) / 100,
    topAuthors,
    statusCounts,
  };

  return <DashboardView stats={stats} initialGoal={goal} />;
}
