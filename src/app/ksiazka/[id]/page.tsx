/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { notFound } from "next/navigation";
import type { CSSProperties } from "react";
import { BookMarked, Star, Calendar, BookOpen, Building2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import AddToLibraryButton from "@/components/AddToLibraryButton";

export const dynamic = "force-dynamic";

const GREEN = "#153A2C";
const BONE = "#ECE7DA";
const BONE2 = "#F3EFE4";
const INK = "#17251F";
const OCHRE = "#C0871B";
const MUTED = "#5A5B50";
const LINE = "#DAD4C2";

export async function generateMetadata({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data } = await supabase.from("book_catalog").select("title, author").eq("id", params.id).maybeSingle();
  if (!data) return { title: "Książka — Księgozbiór" };
  return { title: `${data.title} — ${data.author} · Księgozbiór` };
}

export default async function PublicBookPage({ params }: { params: { id: string } }) {
  const supabase = createClient();

  const { data: book } = await supabase.from("book_catalog").select("*").eq("id", params.id).maybeSingle();
  if (!book) notFound();

  const { data: reviews } = await supabase
    .from("reviews")
    .select("rating, body, created_at, user:profiles(username, display_name)")
    .eq("book_id", params.id)
    .eq("is_public", true)
    .order("created_at", { ascending: false });

  const list = reviews ?? [];
  const ratings = list.map((r: any) => r.rating).filter((n: any) => typeof n === "number");
  const avg = ratings.length ? Math.round((ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length) * 10) / 10 : null;

  const { data: { user } } = await supabase.auth.getUser();
  const color = (book as any).cover_color ?? "#3D4A6B";

  return (
    <div style={{ minHeight: "100vh", background: BONE }}>
      {/* Lekki nagłówek publiczny */}
      <header style={navBar}>
        <div style={navInner}>
          <Link href="/" style={brand}><BookMarked size={20} color={GREEN} /><span style={brandText}>Księgozbiór</span></Link>
          <Link href={user ? "/biblioteka" : "/login"} style={navBtn}>{user ? "Moja biblioteka" : "Zaloguj"}</Link>
        </div>
      </header>

      <main style={main}>
        <div className="book-hero" style={hero}>
          <div style={coverBox}>
            {(book as any).cover_image_url ? (
              <img src={(book as any).cover_image_url} alt={book.title} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "4px 8px 8px 4px" }} />
            ) : (
              <div style={{ ...coverFallback, background: `linear-gradient(150deg, ${color}, #00000030)` }}>
                <div style={coverFallbackTitle}>{book.title}</div>
              </div>
            )}
          </div>

          <div style={{ flex: 1 }}>
            <h1 style={title}>{book.title}</h1>
            <p style={author}>{book.author}</p>

            <div style={facts}>
              {book.publication_year && <span style={fact}><Calendar size={14} /> {book.publication_year}</span>}
              {book.page_count && <span style={fact}><BookOpen size={14} /> {book.page_count} s.</span>}
              {book.publisher && <span style={fact}><Building2 size={14} /> {book.publisher}</span>}
            </div>

            <div style={ratingRow}>
              {avg != null ? (
                <>
                  <div style={{ display: "flex", gap: 2 }}>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Star key={n} size={18} fill={n <= Math.round(avg) ? OCHRE : "none"} color={n <= Math.round(avg) ? OCHRE : "#C7BE9E"} strokeWidth={1.5} />
                    ))}
                  </div>
                  <span style={avgNum}>{avg.toFixed(1)}</span>
                  <span style={ratingCount}>· {ratings.length} {ratings.length === 1 ? "ocena" : "ocen"}</span>
                </>
              ) : (
                <span style={ratingCount}>Brak ocen — bądź pierwszy.</span>
              )}
            </div>

            {book.description && <p style={desc}>{book.description}</p>}

            <div style={{ marginTop: 22 }}>
              <AddToLibraryButton bookId={book.id} isLoggedIn={!!user} />
            </div>
          </div>
        </div>

        <section style={{ marginTop: 56 }}>
          <h2 style={h2}>Recenzje czytelników</h2>
          {list.length === 0 ? (
            <p style={{ fontSize: 15, color: MUTED, marginTop: 12 }}>Nikt jeszcze nie zrecenzował tej książki.</p>
          ) : (
            <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 14 }}>
              {list.map((r: any, i: number) => (
                <div key={i} style={reviewCard}>
                  <div style={reviewHead}>
                    <span style={reviewer}>{r.user?.display_name || r.user?.username || "Czytelnik"}</span>
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

const main: CSSProperties = { maxWidth: 1000, margin: "0 auto", padding: "48px 24px 100px" };
const hero: CSSProperties = { display: "flex", gap: 40, alignItems: "flex-start" };
const coverBox: CSSProperties = { width: 180, height: 270, borderRadius: "4px 8px 8px 4px", boxShadow: "0 16px 36px rgba(23,37,31,0.28)", overflow: "hidden", flexShrink: 0 };
const coverFallback: CSSProperties = { width: "100%", height: "100%", padding: 18, color: "#fff", display: "flex", flexDirection: "column" };
const coverFallbackTitle: CSSProperties = { fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 600, lineHeight: 1.15 };
const title: CSSProperties = { fontFamily: "var(--font-display)", fontSize: 40, fontWeight: 600, color: INK, margin: 0, lineHeight: 1.08 };
const author: CSSProperties = { fontSize: 18, color: MUTED, margin: "8px 0 0" };
const facts: CSSProperties = { display: "flex", flexWrap: "wrap", gap: 16, margin: "18px 0 0" };
const fact: CSSProperties = { display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: MUTED };
const ratingRow: CSSProperties = { display: "flex", alignItems: "center", gap: 10, marginTop: 18 };
const avgNum: CSSProperties = { fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 700, color: INK };
const ratingCount: CSSProperties = { fontSize: 14, color: MUTED };
const desc: CSSProperties = { fontSize: 16, lineHeight: 1.65, color: "#3A4A42", marginTop: 20, maxWidth: "60ch" };
const h2: CSSProperties = { fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 600, color: INK, margin: 0 };
const reviewCard: CSSProperties = { background: BONE2, border: "1px solid " + LINE, borderRadius: 14, padding: 18 };
const reviewHead: CSSProperties = { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 };
const reviewer: CSSProperties = { fontSize: 14, fontWeight: 600, color: INK };
const reviewBody: CSSProperties = { fontSize: 15, lineHeight: 1.55, color: "#3A4A42", margin: 0, whiteSpace: "pre-wrap" };
