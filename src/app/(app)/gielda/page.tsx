import { createClient } from "@/lib/supabase/server";
import GieldaView from "@/components/GieldaView";

export const dynamic = "force-dynamic";

export default async function GieldaPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let query = supabase
    .from("listings")
    .select("id, condition_desc, preferred_notes, city, created_at, book:book_catalog(id, title, author, cover_color, cover_image_url), owner:profiles(username, display_name)")
    .eq("status", "active")
    .order("created_at", { ascending: false });
  if (user) query = query.neq("user_id", user.id);

  const { data } = await query;
  const listings = (data ?? []).filter((l: any) => l.book);

  return <GieldaView listings={listings as any} isLoggedIn={!!user} />;
}
