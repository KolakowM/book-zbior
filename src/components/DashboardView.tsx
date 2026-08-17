"use client";

import { useState } from "react";
import type { CSSProperties } from "react";
import { Star, Pencil, Check, TrendingUp, BookOpen, Repeat, Library } from "lucide-react";
import { setReadingGoal } from "@/lib/actions/profile";

const BONE2 = "#F3EFE4";
const INK = "#17251F";
const GREEN = "#153A2C";
const RUST = "#B0472A";
const OCHRE = "#C0871B";
const MUTED = "#5A5B50";
const LINE = "#DAD4C2";

const MONTHS = ["Sty", "Lut", "Mar", "Kwi", "Maj", "Cze", "Lip", "Sie", "Wrz", "Paź", "Lis", "Gru"];

const STATUS_META: { key: keyof Stats["statusCounts"]; label: string; color: string }[] = [
  { key: "read", label: "Przeczytane", color: "#2E6B4F" },
  { key: "reading", label: "W trakcie", color: RUST },
  { key: "want_to_read", label: "Do przeczytania", color: OCHRE },
  { key: "abandoned", label: "Porzucone", color: "#7A7566" },
];

type Stats = {
  year: number;
  booksReadYear: number;
  pagesReadYear: number;
  totalBooks: number;
  avgRating: number;
  forExchange: number;
  monthly: number[];
  totalSpend: number;
  topAuthors: { name: string; count: number }[];
  statusCounts: { read: number; reading: number; want_to_read: number; abandoned: number };
};

const zl = (n: number) => n.toLocaleString("pl-PL", { minimumFractionDigits: 0, maximumFractionDigits: 2 }) + " zł";

export default function DashboardView({ stats, initialGoal }: { stats: Stats; initialGoal: number }) {
  const [goal, setGoal] = useState(initialGoal);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(initialGoal));
  const [busy, setBusy] = useState(false);

  const saveGoal = async () => {
    const g = parseInt(draft, 10);
    if (!Number.isFinite(g) || g < 1) return;
    setBusy(true);
    setGoal(g);
    try { await setReadingGoal(g); } catch { /* kolumna może wymagać migracji */ }
    setBusy(false);
    setEditing(false);
  };

  const pct = goal > 0 ? Math.min(1, stats.booksReadYear / goal) : 0;
  const R = 52, C = 2 * Math.PI * R;
  const maxSpend = Math.max(1, ...stats.monthly);
  const maxAuthor = Math.max(1, ...stats.topAuthors.map((a) => a.count));
  const avgMonth = stats.totalSpend / 12;
  const totalStatus = Object.values(stats.statusCounts).reduce((a, b) => a + b, 0) || 1;

  return (
    <div style={wrap}>
      <style>{`
        @media (max-width: 820px) {
          .dash-grid { grid-template-columns: 1fr !important; }
          .dash-grid > div { grid-column: auto !important; }
        }
      `}</style>
      <div style={head}>
        <h1 style={title}>Wyzwania i statystyki</h1>
        <p style={sub}>Twoja pasja w liczbach — od stron po złotówki. Rok {stats.year}.</p>
      </div>

      <div className="dash-grid" style={grid}>
        {/* Wyzwanie roczne */}
        <div style={card}>
          <div style={cardHeadRow}>
            <h2 style={cardH}>Wyzwanie roczne</h2>
            {!editing && (
              <button style={iconBtn} onClick={() => { setDraft(String(goal)); setEditing(true); }} aria-label="Zmień cel"><Pencil size={15} /></button>
            )}
          </div>
          <div style={{ display: "flex", justifyContent: "center", padding: "8px 0 4px" }}>
            <div style={{ position: "relative", width: 140, height: 140 }}>
              <svg width={140} height={140}>
                <circle cx={70} cy={70} r={R} fill="none" stroke="#E1DAC8" strokeWidth={12} />
                <circle cx={70} cy={70} r={R} fill="none" stroke={GREEN} strokeWidth={12}
                  strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - pct)}
                  transform="rotate(-90 70 70)" />
              </svg>
              <div style={ringCenter}>
                <div style={ringNum}>{stats.booksReadYear}<span style={{ color: MUTED, fontSize: 20 }}> / {goal}</span></div>
                <div style={ringPct}>{Math.round(pct * 100)}% celu</div>
              </div>
            </div>
          </div>
          {editing ? (
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <input style={goalInput} inputMode="numeric" value={draft} onChange={(e) => setDraft(e.target.value)} />
              <button style={goalSave} onClick={saveGoal} disabled={busy}><Check size={15} /> Zapisz</button>
            </div>
          ) : (
            <p style={cardFoot}>
              {stats.booksReadYear >= goal
                ? "Cel osiągnięty — brawo!"
                : `Zostało ${goal - stats.booksReadYear} książek do końca roku.`}
            </p>
          )}
        </div>

        {/* Wydatki miesięczne */}
        <div style={{ ...card, gridColumn: "span 2" }}>
          <h2 style={cardH}>Wydatki na książki (miesięcznie)</h2>
          <div style={barChart}>
            {stats.monthly.map((v, i) => (
              <div key={i} style={barCol} title={`${MONTHS[i]}: ${zl(v)}`}>
                <div style={{ ...bar, height: `${(v / maxSpend) * 100}%`, background: v > 0 ? GREEN : "#E1DAC8" }} />
                <span style={barLabel}>{MONTHS[i]}</span>
              </div>
            ))}
          </div>
          <p style={cardFoot}>
            Suma w tym roku: <strong style={{ color: INK }}>{zl(stats.totalSpend)}</strong>
            {stats.totalSpend > 0 ? ` · średnio ${zl(Math.round(avgMonth * 100) / 100)} / mies.` : ""}
          </p>
        </div>

        {/* Najczęściej czytani autorzy */}
        <div style={{ ...card, gridColumn: "span 2" }}>
          <h2 style={cardH}>Najczęściej czytani autorzy</h2>
          {stats.topAuthors.length === 0 ? (
            <p style={cardFoot}>Dodaj książki, aby zobaczyć autorów.</p>
          ) : (
            <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 14 }}>
              {stats.topAuthors.map((a) => (
                <div key={a.name}>
                  <div style={authorRow}><span style={authorName}>{a.name}</span><span style={authorCount}>{a.count} {a.count === 1 ? "książka" : "książek"}</span></div>
                  <div style={authorTrack}><div style={{ ...authorFill, width: `${(a.count / maxAuthor) * 100}%` }} /></div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* W skrócie */}
        <div style={card}>
          <h2 style={cardH}>W skrócie</h2>
          <div style={tileGrid}>
            <Tile icon={BookOpen} num={stats.pagesReadYear.toLocaleString("pl-PL")} label="przeczytane strony" />
            <Tile icon={Star} num={stats.avgRating ? stats.avgRating.toFixed(1) : "—"} label="średnia Twoja ocena" />
            <Tile icon={Library} num={String(stats.totalBooks)} label="pozycje w bibliotece" />
            <Tile icon={Repeat} num={String(stats.forExchange)} label="do wymiany" />
          </div>
        </div>

        {/* Rozkład statusów */}
        <div style={{ ...card, gridColumn: "span 3" }}>
          <h2 style={cardH}>Twoja półka w podziale na statusy</h2>
          <div style={segBar}>
            {STATUS_META.map((s) => {
              const v = stats.statusCounts[s.key];
              if (!v) return null;
              return <div key={s.key} style={{ width: `${(v / totalStatus) * 100}%`, background: s.color }} title={`${s.label}: ${v}`} />;
            })}
          </div>
          <div style={legend}>
            {STATUS_META.map((s) => (
              <div key={s.key} style={legendItem}>
                <span style={{ ...legendDot, background: s.color }} />
                {s.label} <strong style={{ color: INK, marginLeft: 4 }}>{stats.statusCounts[s.key]}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Tile({ icon: Icon, num, label }: { icon: any; num: string; label: string }) {
  return (
    <div style={tile}>
      <Icon size={16} color={RUST} />
      <div style={tileNum}>{num}</div>
      <div style={tileLabel}>{label}</div>
    </div>
  );
}

const wrap: CSSProperties = { maxWidth: 1080, margin: "0 auto", padding: "40px 20px 120px" };
const head: CSSProperties = { marginBottom: 28 };
const title: CSSProperties = { fontFamily: "var(--font-display)", fontSize: 36, fontWeight: 600, color: INK, margin: 0 };
const sub: CSSProperties = { fontSize: 16, color: MUTED, marginTop: 8 };
const grid: CSSProperties = { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 };
const card: CSSProperties = { background: BONE2, border: "1px solid " + LINE, borderRadius: 16, padding: 22 };
const cardHeadRow: CSSProperties = { display: "flex", justifyContent: "space-between", alignItems: "center" };
const cardH: CSSProperties = { fontFamily: "var(--font-display)", fontSize: 19, fontWeight: 600, color: INK, margin: 0 };
const iconBtn: CSSProperties = { background: "none", border: "none", color: MUTED, cursor: "pointer", padding: 4 };
const cardFoot: CSSProperties = { fontSize: 13, color: MUTED, marginTop: 14, textAlign: "center" };

const ringCenter: CSSProperties = { position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" };
const ringNum: CSSProperties = { fontFamily: "var(--font-display)", fontSize: 30, fontWeight: 700, color: INK, lineHeight: 1 };
const ringPct: CSSProperties = { fontSize: 12, color: MUTED, marginTop: 4 };
const goalInput: CSSProperties = { flex: 1, border: "1px solid " + LINE, background: "#ECE7DA", borderRadius: 8, padding: "9px 10px", fontSize: 14, color: INK, outline: "none" };
const goalSave: CSSProperties = { display: "flex", alignItems: "center", gap: 5, background: GREEN, color: "#fff", border: "none", padding: "0 14px", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer" };

const barChart: CSSProperties = { display: "flex", alignItems: "flex-end", gap: 6, height: 150, marginTop: 18 };
const barCol: CSSProperties = { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", height: "100%" };
const bar: CSSProperties = { width: "100%", maxWidth: 30, borderRadius: "4px 4px 0 0", minHeight: 3, transition: "height .3s" };
const barLabel: CSSProperties = { fontSize: 10, color: MUTED, marginTop: 6 };

const authorRow: CSSProperties = { display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 };
const authorName: CSSProperties = { fontSize: 14, fontWeight: 500, color: INK };
const authorCount: CSSProperties = { fontSize: 12, color: MUTED };
const authorTrack: CSSProperties = { height: 8, background: "#E1DAC8", borderRadius: 4, overflow: "hidden" };
const authorFill: CSSProperties = { height: "100%", background: RUST, borderRadius: 4 };

const tileGrid: CSSProperties = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 16 };
const tile: CSSProperties = { background: "#ECE7DA", border: "1px solid " + LINE, borderRadius: 12, padding: 14 };
const tileNum: CSSProperties = { fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 700, color: INK, marginTop: 8 };
const tileLabel: CSSProperties = { fontSize: 12, color: MUTED, marginTop: 2 };

const segBar: CSSProperties = { display: "flex", height: 16, borderRadius: 8, overflow: "hidden", marginTop: 16, background: "#E1DAC8" };
const legend: CSSProperties = { display: "flex", flexWrap: "wrap", gap: 18, marginTop: 14 };
const legendItem: CSSProperties = { display: "flex", alignItems: "center", gap: 7, fontSize: 13, color: MUTED };
const legendDot: CSSProperties = { width: 10, height: 10, borderRadius: 3 };
