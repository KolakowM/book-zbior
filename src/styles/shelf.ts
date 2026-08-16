import type { CSSProperties } from "react";

export const BONE = "#ECE7DA";
export const BONE2 = "#F3EFE4";
export const GREEN = "#153A2C";
export const INK = "#17251F";
export const RUST = "#B0472A";
export const OCHRE = "#C0871B";
export const MUTED = "#5A5B50";
export const LINE = "#DAD4C2";

// Aliasy dla zgodności z istniejącym kodem.
const PAPER = BONE;

export const s: Record<string, CSSProperties> = {
  page: { fontFamily: "var(--font-body)", maxWidth: 1080, width: "100%", margin: "0 auto", minHeight: "100vh", background: BONE, color: INK, position: "relative", paddingBottom: 96 },

  header: { background: GREEN, color: BONE, padding: "22px 20px 18px", borderRadius: "0 0 22px 22px", position: "relative", zIndex: 1 },
  headerTop: { display: "flex", justifyContent: "space-between", alignItems: "flex-start" },
  eyebrow: { fontSize: 11, letterSpacing: 2.5, color: OCHRE, fontWeight: 600 },
  h1: { fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 600, margin: "2px 0 0", color: "#F4EFE2" },
  avatarBtn: { width: 38, height: 38, borderRadius: "50%", border: "1px solid #2C5A45", background: "#1E4A38", color: BONE, display: "grid", placeItems: "center", textDecoration: "none" },

  statsRow: { display: "flex", alignItems: "center", gap: 14, marginTop: 14 },
  stat: { display: "flex", flexDirection: "column" },
  statNum: { fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 600, lineHeight: 1, color: "#F4EFE2" },
  statLbl: { fontSize: 11, color: "#9FB3A6", marginTop: 3 },
  statDivide: { width: 1, height: 24, background: "#2C5A45" },

  searchWrap: { display: "flex", alignItems: "center", gap: 8, marginTop: 16, background: BONE, borderRadius: 10, padding: "10px 12px", maxWidth: 460 },
  search: { border: "none", background: "transparent", flex: 1, fontSize: 14, color: INK, outline: "none" },
  clearBtn: { border: "none", background: "none", color: MUTED, display: "grid", placeItems: "center", padding: 0, cursor: "pointer" },

  filters: { display: "flex", gap: 8, marginTop: 14, overflowX: "auto", paddingBottom: 2 },
  chip: { whiteSpace: "nowrap", fontSize: 13, fontWeight: 500, padding: "7px 14px", borderRadius: 8, border: "1px solid #2C5A45", background: "transparent", color: "#CFD8CE", cursor: "pointer" },
  chipActive: { background: OCHRE, color: "#231A05", borderColor: OCHRE, fontWeight: 600 },

  main: { padding: "20px 16px 0" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 24 },

  card: { display: "flex", flexDirection: "column", background: "none", border: "none", padding: 0, textAlign: "left" },
  cardInner: { display: "flex", height: 210, borderRadius: "3px 7px 7px 3px", overflow: "hidden", boxShadow: "0 8px 20px rgba(23,37,31,0.18)" },
  spine: { width: 16, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  spineText: { writingMode: "vertical-rl", transform: "rotate(180deg)", fontSize: 8, color: "rgba(255,255,255,0.8)", fontWeight: 600, letterSpacing: 0.5, whiteSpace: "nowrap", overflow: "hidden", maxHeight: 190, textOverflow: "ellipsis" },
  cover: { flex: 1, padding: 14, position: "relative", color: "#fff", display: "flex", flexDirection: "column" },
  coverGloss: { position: "absolute", inset: 0, background: "linear-gradient(105deg, rgba(255,255,255,0.13), transparent 40%)", pointerEvents: "none" },
  coverTitle: { fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 600, lineHeight: 1.15, zIndex: 1 },
  coverAuthor: { fontSize: 11, opacity: 0.85, marginTop: 6, zIndex: 1 },
  progressWrap: { marginTop: "auto", height: 4, background: "rgba(255,255,255,0.25)", borderRadius: 2, zIndex: 1 },
  progressBar: { height: "100%", background: BONE, borderRadius: 2 },

  meta: { marginTop: 10, paddingLeft: 2 },
  metaTop: { display: "flex", alignItems: "center", gap: 6 },
  statusDot: { width: 7, height: 7, borderRadius: "50%", flexShrink: 0 },
  statusLabel: { fontSize: 12, fontWeight: 500, color: MUTED },
  stars: { display: "flex", gap: 2, marginTop: 4 },

  delBtn: { marginTop: 6, background: "none", border: "none", color: "#A5806F", fontSize: 11, cursor: "pointer", padding: 0, display: "flex", alignItems: "center", gap: 4 },

  empty: { textAlign: "center", padding: "60px 20px", color: MUTED },
  emptyText: { fontFamily: "var(--font-display)", fontSize: 18, margin: "12px 0 2px", color: INK },
  emptySub: { fontSize: 13, margin: 0, color: MUTED },

  fab: { position: "fixed", bottom: 84, left: "50%", transform: "translateX(-50%)", display: "flex", alignItems: "center", gap: 6, background: RUST, color: "#fff", border: "none", padding: "13px 22px", borderRadius: 999, fontSize: 15, fontWeight: 600, boxShadow: "0 8px 24px rgba(176,71,42,0.35)", zIndex: 20, cursor: "pointer" },

  overlay: { position: "fixed", inset: 0, background: "rgba(21,26,22,0.5)", zIndex: 50, display: "flex", alignItems: "flex-end", justifyContent: "center" },
  sheet: { width: "100%", maxWidth: 430, background: BONE, borderRadius: "22px 22px 0 0", padding: "12px 20px 28px" },
  sheetHandle: { width: 40, height: 4, background: "#CFC7B2", borderRadius: 2, margin: "0 auto 14px" },
  sheetTitle: { fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 600, margin: "0 0 16px" },
  scanBtn: { width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: GREEN, color: BONE, border: "none", padding: "14px", borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: "pointer" },
  orLine: { textAlign: "center", margin: "16px 0", borderTop: "1px solid " + LINE, position: "relative" },
  orText: { position: "relative", top: -10, background: BONE, padding: "0 12px", fontSize: 12, color: MUTED },
  fieldLabel: { display: "block", fontSize: 12, fontWeight: 600, color: MUTED, margin: "0 0 6px" },
  field: { width: "100%", border: "1px solid " + LINE, background: BONE2, borderRadius: 9, padding: "12px", fontSize: 15, color: INK, marginBottom: 14, outline: "none" },
  statusPicker: { display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 8 },
  statusOpt: { display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 500, padding: "8px 12px", borderRadius: 999, border: "1px solid " + LINE, background: BONE2, color: MUTED, cursor: "pointer" },
  sheetActions: { display: "flex", gap: 10, marginTop: 18 },
  btnGhost: { flex: 1, background: "transparent", border: "1px solid " + LINE, color: MUTED, padding: "13px", borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: "pointer" },
  btnPrimary: { flex: 2, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: RUST, color: "#fff", border: "none", padding: "13px", borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: "pointer" },
};
