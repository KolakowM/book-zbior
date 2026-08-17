"use client";

/* eslint-disable @next/next/no-img-element */
import { useMemo, useState } from "react";
import Link from "next/link";
import type { CSSProperties } from "react";
import { Search, MapPin, Store } from "lucide-react";
import ProposeExchangeButton from "./ProposeExchangeButton";

const INK = "#17251F";
const BONE2 = "#F3EFE4";
const MUTED = "#5A5B50";
const LINE = "#DAD4C2";

type Listing = {
  id: string;
  condition_desc: string | null;
  preferred_notes: string | null;
  city: string | null;
  book: { id: string; title: string; author: string; cover_color: string | null; cover_image_url: string | null };
  owner: { username: string; display_name: string | null } | null;
};

export default function GieldaView({ listings, isLoggedIn }: { listings: Listing[]; isLoggedIn: boolean }) {
  const [q, setQ] = useState("");
  const [city, setCity] = useState("");

  const cities = useMemo(() => Array.from(new Set(listings.map((l) => l.city).filter(Boolean))) as string[], [listings]);

  const filtered = useMemo(
    () => listings.filter((l) => {
      const matchQ = (l.book.title + " " + l.book.author).toLowerCase().includes(q.toLowerCase());
      const matchCity = !city || l.city === city;
      return matchQ && matchCity;
    }),
    [listings, q, city]
  );

  return (
    <div style={wrap}>
      <div style={head}>
        <div style={titleRow}><Store size={26} color="#B0472A" /><h1 style={title}>Giełda książek</h1></div>
        <p style={sub}>Egzemplarze wystawione do wymiany przez czytelników. Umawiacie się bezpośrednio.</p>
      </div>

      <div style={filters}>
        <div style={searchWrap}>
          <Search size={16} color={MUTED} />
          <input style={search} placeholder="Szukaj tytułu lub autora" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <select style={select} value={city} onChange={(e) => setCity(e.target.value)}>
          <option value="">Wszystkie miasta</option>
          {cities.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div style={empty}>
          <Store size={30} color="#B7B09A" strokeWidth={1.5} />
          <p style={emptyText}>{listings.length === 0 ? "Nikt jeszcze nic nie wystawił." : "Nic nie pasuje do filtrów."}</p>
          <p style={emptySub}>Oznacz swoją książkę jako „do wymiany" w karcie, a pojawi się tutaj.</p>
        </div>
      ) : (
        <div style={grid}>
          {filtered.map((l) => (
            <div key={l.id} style={card}>
              <Link href={`/ksiazka/${l.book.id}`} style={{ textDecoration: "none" }}>
                <div style={{ ...cover, background: `linear-gradient(150deg, ${l.book.cover_color || "#3D4A6B"}, ${(l.book.cover_color || "#3D4A6B")}CC)` }}>
                  {l.book.cover_image_url ? (
                    <img src={l.book.cover_image_url} alt={l.book.title} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 4 }} />
                  ) : (
                    <span style={coverTitle}>{l.book.title}</span>
                  )}
                </div>
              </Link>
              <div style={{ padding: "12px 14px 14px" }}>
                <Link href={`/ksiazka/${l.book.id}`} style={bookLink}>{l.book.title}</Link>
                <p style={author}>{l.book.author}</p>
                {l.condition_desc && <p style={cond}>Stan: {l.condition_desc}</p>}
                {l.preferred_notes && <p style={pref}>Szuka: {l.preferred_notes}</p>}
                <div style={ownerRow}>
                  {l.owner && <Link href={`/u/${l.owner.username}`} style={ownerLink}>@{l.owner.username}</Link>}
                  {l.city && <span style={cityTag}><MapPin size={12} /> {l.city}</span>}
                </div>
                <div style={{ marginTop: 12 }}>
                  <ProposeExchangeButton listingId={l.id} isLoggedIn={isLoggedIn} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const wrap: CSSProperties = { maxWidth: 1080, margin: "0 auto", padding: "40px 20px 120px" };
const head: CSSProperties = { marginBottom: 22 };
const titleRow: CSSProperties = { display: "flex", alignItems: "center", gap: 12 };
const title: CSSProperties = { fontFamily: "var(--font-display)", fontSize: 34, fontWeight: 600, color: INK, margin: 0 };
const sub: CSSProperties = { fontSize: 16, color: MUTED, marginTop: 10, maxWidth: "60ch" };
const filters: CSSProperties = { display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" };
const searchWrap: CSSProperties = { display: "flex", alignItems: "center", gap: 8, background: BONE2, border: "1px solid " + LINE, borderRadius: 10, padding: "10px 13px", flex: 1, minWidth: 220 };
const search: CSSProperties = { border: "none", background: "transparent", flex: 1, fontSize: 14, color: INK, outline: "none" };
const select: CSSProperties = { border: "1px solid " + LINE, background: BONE2, borderRadius: 10, padding: "10px 13px", fontSize: 14, color: INK, outline: "none", fontFamily: "var(--font-body)" };
const grid: CSSProperties = { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 20 };
const card: CSSProperties = { background: BONE2, border: "1px solid " + LINE, borderRadius: 14, overflow: "hidden" };
const cover: CSSProperties = { height: 180, padding: 14, color: "#fff", display: "flex", alignItems: "flex-start", overflow: "hidden", position: "relative" };
const coverTitle: CSSProperties = { fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 600, lineHeight: 1.15 };
const bookLink: CSSProperties = { fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 600, color: INK, textDecoration: "none", lineHeight: 1.2, display: "block" };
const author: CSSProperties = { fontSize: 13, color: MUTED, margin: "4px 0 0" };
const cond: CSSProperties = { fontSize: 12.5, color: "#3A4A42", margin: "8px 0 0" };
const pref: CSSProperties = { fontSize: 12.5, color: "#3A4A42", margin: "3px 0 0" };
const ownerRow: CSSProperties = { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginTop: 10 };
const ownerLink: CSSProperties = { fontSize: 13, fontWeight: 600, color: "#B0472A", textDecoration: "none" };
const cityTag: CSSProperties = { display: "inline-flex", alignItems: "center", gap: 3, fontSize: 12, color: MUTED };
const empty: CSSProperties = { textAlign: "center", padding: "70px 20px", color: MUTED };
const emptyText: CSSProperties = { fontFamily: "var(--font-display)", fontSize: 19, margin: "12px 0 2px", color: INK };
const emptySub: CSSProperties = { fontSize: 14, margin: 0, color: MUTED };
