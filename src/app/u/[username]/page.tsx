/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { notFound } from "next/navigation";
import type { CSSProperties } from "react";
import { BookMarked, Star } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import FollowButton from "@/components/FollowButton";

export const dynamic = "force-dynamic";

const GREEN = "#153A2C";
const BONE = "#ECE7DA";
const BONE2 = "#F3EFE4";
const INK = "#17251F";
const OCHRE = "#C0871B";
const MUTED = "#5A5B50";
const LINE = "#DAD4C2";

const STATUS_LABEL: Record<string, string> = {
  read: "Przeczytana", reading: "W trakcie", want_to_read: "Do przeczytania", abandoned: "Porzucona",
};

export async function generateMetadata({ params }: { params: { username: string } }) {
  return { title: `@${params.username} · Księgozbiór` };
}

export default async function PublicProfilePage({ params }: { params: { username: string } }) {
  const supabase = createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, username, display_name, city, bio")
    .eq("username", params.username)
    .maybeSingle();
  if (!profile) notFound();
  const prof = profile as any;

  // Publiczna półka (widok bez danych finansowych) + książki
  const { data: shelfRows } = await supabase
    .from("public_shelf")
    .select("book_id, reading_status, user_rating, added_at")
    .eq("user_id", prof.id)
    .order("added_at", { ascending: false });

  const bookIds = (shelfRows ?? []).map((r: any) => r.book_id);
  let bookMap: Record<string, any> = {};
  if (bookIds.length) {
    const { data: books } = await supabase
      .from("book_catalog")
      .select("id, title, author, cover_color, cover_image_url")
      .in("id", bookIds);
    bookMap = Object.fromEntries((books ?? []).map((b: any) => [b.id, b]));
  }
  const shelf = (shelfRows ?? []).map((r: any) => ({ ...r, book: bookMap[r.book_id] })).filter((r: any) => r.book).slice(0, 12);

  const { data: reviews } = await supabase
    .from("reviews")
    .select("rating, body, created_at, book:book_catalog(id, title, author)")
    .eq("user_id", prof.id)
    .eq("is_public", true)
    .order("created_at", { ascending: false });
  const reviewList = reviews ?? [];

  const [{ count: followers }, { count: following }] = await Promise.all([
    supabase.from("follows").select("*", { count: "exact", head: true }).eq("following_id", prof.id),
    supabase.from("follows").select("*", { count: "exact", head: true }).eq("follower_id", prof.id),
  ]);

  const { data: { user } } = await supabase.auth.getUser();
  const isSelf = user?.id === prof.id;
  let isFollowing = false;
  if (user && !isSelf) {
    const { data: f } = await supabase
      .from("follows")
      .select("follower_id")
      .eq("follower_id", user.id)
      .eq("following_id", prof.id)
      .maybeSingle();
    isFollowing = !!f;
  }

  const initials = (prof.display_name || prof.username || "?").slice(0, 2).toUpperCase();

  return (
    <div style={{ minHeight: "100vh", background: BONE }}>
      <header style={navBar}>
        <div style={navInner}>
          <Link href="/" style={brand}><BookMarked size={20} color={GREEN} /><span style={brandText}>Księgozbiór</span></Link>
          <Link href={user ? "/biblioteka" : "/login"} style={navBtn}>{user ? "Moja biblioteka" : "Zaloguj"}</Link>
        </div>
      </header>

      <main style={main}>
        <div style={hero}>
          <div style={avatar}>{initials}</div>
          <div style={{ flex: 1 }}>
            <h1 style={name}>{prof.display_name || prof.username}</h1>
            <p style={handle}>@{prof.username}{prof.city ? ` · ${prof.city}` : ""}</p>
            {prof.bio && <p style={bio}>{prof.bio}</p>}
            <div style={{ display: "flex", alignItems: "center", gap: 20, marginTop: 16, flexWrap: "wrap" }}>
              <span style={countText}><strong style={{ color: INK }}>{followers ?? 0}</strong> obserwujących</span>
              <span style={countText}><strong style={{ color: INK }}>{following ?? 0}</strong> obserwowanych</span>
              {isSelf ? (
                <Link href="/profil" style={selfBtn}>To Twój profil — edytuj</Link>
              ) : (
                <FollowButton targetId={prof.id} initialFollowing={isFollowing} isLoggedIn={!!user} />
              )}
            </div>
          </div>
        </div>

        <section style={{ marginTop: 48 }}>
          <h2 style={h2}>Półka</h2>
          {shelf.length === 0 ? (
            <p style={emptyText}>Ta osoba nie udostępniła jeszcze żadnych książek.</p>
          ) : (
            <div style={shelfGrid}>
              {shelf.map((r: any) => (
                <Link key={r.book_id} href={`/ksiazka/${r.book_id}`} style={shelfItem}>
                  <div style={{ ...cover, background: `linear-gradient(150deg, ${r.book.cover_color || "#3D4A6B"}, ${(r.book.cover_color || "#3D4A6B")}CC)` }}>
                    {r.book.cover_image_url ? (
                      <img src={r.book.cover_image_url} alt={r.book.title} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 4 }} />
                    ) : (
                      <span style={coverTitle}>{r.book.title}</span>
                    )}
                  </div>
                  <div style={shelfMeta}>
                    {r.user_rating ? (
                      <div style={{ display: "flex", gap: 1 }}>
                        {[1, 2, 3, 4, 5].map((n) => (
                          <Star key={n} size={10} fill={n <= r.user_rating ? OCHRE : "none"} color={n <= r.user_rating ? OCHRE : "#C7BE9E"} strokeWidth={1.5} />
                        ))}
                      </div>
                    ) : (
                      <span style={statusText}>{STATUS_LABEL[r.reading_status] || ""}</span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section style={{ marginTop: 48 }}>
          <h2 style={h2}>Recenzje</h2>
          {reviewList.length === 0 ? (
            <p style={emptyText}>Brak publicznych recenzji.</p>
          ) : (
            <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 14 }}>
              {reviewList.map((r: any, i: number) => (
                <div key={i} style={reviewCard}>
                  <div style={reviewHead}>
                    <Link href={`/ksiazka/${r.book?.id}`} style={reviewBookLink}>{r.book?.title} <span style={{ color: MUTED, fontWeight: 400 }}>· {r.book?.author}</span></Link>
                    <div style={{ display: "flex", gap: 2 }}>
                      {[1, 2, 3, 4, 5].map((n) => (
                        <Star key={n} size={13} fill={n <= r.rating ? OCHRE : "none"} color={n <= r.rating ? OCHRE : "#C7BE9E"} strokeWidth={1.5} />
                      ))}
                    </div>
                  </div>
                  {r.body && <p style={reviewBody}>{r.body}</p>}
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

const navBar: CSSProperties = { background: "rgba(236,231,218,0.92)", borderBottom: "1px solid " + LINE, position: "sticky", top: 0, zIndex: 20 };
const navInner: CSSProperties = { maxWidth: 1000, margin: "0 auto", padding: "0 24px", height: 62, display: "flex", alignItems: "center", justifyContent: "space-between" };
const brand: CSSProperties = { display: "flex", alignItems: "center", gap: 8, textDecoration: "none" };
const brandText: CSSProperties = { fontFamily: "var(--font-display)", fontSize: 19, fontWeight: 600, color: INK };
const navBtn: CSSProperties = { fontSize: 14, fontWeight: 600, color: "#fff", background: GREEN, padding: "8px 16px", borderRadius: 8, textDecoration: "none" };

const main: CSSProperties = { maxWidth: 1000, margin: "0 auto", padding: "44px 24px 100px" };
const hero: CSSProperties = { display: "flex", gap: 26, alignItems: "flex-start" };
const avatar: CSSProperties = { width: 84, height: 84, borderRadius: "50%", background: GREEN, color: "#fff", fontFamily: "var(--font-display)", fontSize: 30, fontWeight: 600, display: "grid", placeItems: "center", flexShrink: 0 };
const name: CSSProperties = { fontFamily: "var(--font-display)", fontSize: 34, fontWeight: 600, color: INK, margin: 0 };
const handle: CSSProperties = { fontSize: 15, color: MUTED, marginTop: 6 };
const bio: CSSProperties = { fontSize: 15, color: "#3A4A42", margin: "12px 0 0", maxWidth: "60ch", lineHeight: 1.55 };
const countText: CSSProperties = { fontSize: 14, color: MUTED };
const selfBtn: CSSProperties = { fontSize: 14, fontWeight: 600, color: INK, border: "1px solid " + LINE, padding: "10px 18px", borderRadius: 9, textDecoration: "none" };
const h2: CSSProperties = { fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 600, color: INK, margin: 0 };
const emptyText: CSSProperties = { fontSize: 15, color: MUTED, marginTop: 12 };
const shelfGrid: CSSProperties = { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))", gap: 16, marginTop: 18 };
const shelfItem: CSSProperties = { textDecoration: "none" };
const cover: CSSProperties = { height: 150, borderRadius: 6, padding: 10, color: "#fff", display: "flex", alignItems: "flex-start", boxShadow: "0 6px 16px rgba(23,37,31,0.18)", overflow: "hidden", position: "relative" };
const coverTitle: CSSProperties = { fontFamily: "var(--font-display)", fontSize: 14, fontWeight: 600, lineHeight: 1.15 };
const shelfMeta: CSSProperties = { marginTop: 7 };
const statusText: CSSProperties = { fontSize: 11, color: MUTED };
const reviewCard: CSSProperties = { background: BONE2, border: "1px solid " + LINE, borderRadius: 14, padding: 18 };
const reviewHead: CSSProperties = { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 8 };
const reviewBookLink: CSSProperties = { fontSize: 14, fontWeight: 600, color: INK, textDecoration: "none" };
const reviewBody: CSSProperties = { fontSize: 15, lineHeight: 1.55, color: "#3A4A42", margin: 0, whiteSpace: "pre-wrap" };
