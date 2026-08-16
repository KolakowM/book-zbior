"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from "react";
import { X, Star, Repeat, Calendar, BookOpen, Building2, Check, Edit3 } from "lucide-react";
import { STATUSES, STATUS_KEYS } from "@/lib/statuses";
import { updateStatus, updateRating, saveReview, toggleSwap, getBookExtras } from "@/lib/actions/library";
import type { LibraryItem, ReadingStatus } from "@/lib/types";

const PAPER = "#F4EEE0";
const INK = "#20303A";
const FOREST = "#2F5D50";
const BRASS = "#B88A2E";
const MUTED = "#6C6A5C";

export default function BookDrawer({ item, onClose }: { item: LibraryItem; onClose: () => void }) {
  const [show, setShow] = useState(false);
  const [status, setStatus] = useState<ReadingStatus>(item.reading_status);
  const [rating, setRating] = useState<number>(item.user_rating ?? 0);
  const [forExchange, setForExchange] = useState(false);
  const [reviewBody, setReviewBody] = useState("");
  const [editingReview, setEditingReview] = useState(false);
  const [draft, setDraft] = useState("");
  const [savingReview, setSavingReview] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const color = item.book.cover_color ?? "#3D4A6B";
  const cover = item.book.cover_image_url;

  useEffect(() => {
    setShow(true);
    getBookExtras(item.id, item.book_id).then((x) => {
      setReviewBody(x.reviewBody);
      setDraft(x.reviewBody);
      setForExchange(x.forExchange);
      setLoaded(true);
    });
  }, [item.id, item.book_id]);

  const close = () => {
    setShow(false);
    setTimeout(onClose, 260);
  };

  const pickStatus = (k: ReadingStatus) => {
    setStatus(k);
    updateStatus(item.id, k).catch(() => {});
  };
  const pickRating = (n: number) => {
    const next = n === rating ? 0 : n;
    setRating(next);
    updateRating(item.id, next).catch(() => {});
  };
  const flipSwap = () => {
    const next = !forExchange;
    setForExchange(next);
    toggleSwap(item.id, next).catch(() => setForExchange(!next));
  };
  const submitReview = async () => {
    if (rating < 1) return;
    setSavingReview(true);
    try {
      await saveReview(item.book_id, draft, rating);
      setReviewBody(draft.trim());
      setEditingReview(false);
    } catch {
      alert("Nie udało się zapisać recenzji.");
    } finally {
      setSavingReview(false);
    }
  };

  return (
    <>
      <style>{css}</style>
      <div className={`drawer-backdrop ${show ? "open" : ""}`} style={backdrop} onClick={close} />
      <aside className={`drawer-panel ${show ? "open" : ""}`} style={panel}>
        <button style={closeBtn} onClick={close} aria-label="Zamknij"><X size={20} /></button>

        {/* Nagłówek z okładką */}
        <div style={{ ...hero, background: `linear-gradient(165deg, ${color}, ${color}AA)` }}>
          <div style={coverBox}>
            {cover ? (
              <img src={cover} alt={item.book.title} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "4px 8px 8px 4px" }} />
            ) : (
              <div style={{ ...coverFallback, background: `linear-gradient(150deg, ${color}, #00000030)` }}>
                <div style={coverFallbackTitle}>{item.book.title}</div>
              </div>
            )}
          </div>
        </div>

        <div style={body}>
          <h2 style={titleStyle}>{item.book.title}</h2>
          <p style={authorStyle}>{item.book.author}</p>

          <div style={facts}>
            {item.book.publication_year && <span style={fact}><Calendar size={13} /> {item.book.publication_year}</span>}
            {item.book.page_count && <span style={fact}><BookOpen size={13} /> {item.book.page_count} s.</span>}
            {item.book.publisher && <span style={fact}><Building2 size={13} /> {item.book.publisher}</span>}
          </div>

          {/* Status */}
          <div style={sectionLabel}>Status</div>
          <div style={statusPicker}>
            {STATUS_KEYS.map((k) => (
              <button key={k} onClick={() => pickStatus(k)}
                style={{ ...statusOpt, ...(status === k ? { borderColor: STATUSES[k].dot, background: STATUSES[k].dot + "18", color: "#3A3527" } : {}) }}>
                <span style={{ ...dot, background: STATUSES[k].dot }} />
                {STATUSES[k].label}
              </button>
            ))}
          </div>

          {/* Ocena */}
          <div style={sectionLabel}>Twoja ocena</div>
          <div style={{ display: "flex", gap: 6 }}>
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} onClick={() => pickRating(n)} style={starBtn} aria-label={`Ocena ${n}`}>
                <Star size={30} fill={n <= rating ? "#C9A227" : "none"} color={n <= rating ? "#C9A227" : "#C4B896"} strokeWidth={1.4} />
              </button>
            ))}
          </div>

          {/* Wymiana */}
          <button onClick={flipSwap} style={{ ...swapToggle, ...(forExchange ? swapOn : {}) }}>
            <Repeat size={16} />
            {forExchange ? "Dostępna do wymiany — kliknij, aby wycofać" : "Oznacz jako dostępną do wymiany"}
          </button>

          {/* Recenzja */}
          <div style={sectionLabel}>Twoja recenzja</div>
          {!loaded ? (
            <p style={{ fontSize: 13, color: MUTED }}>Wczytywanie…</p>
          ) : editingReview || (!reviewBody && rating >= 1) ? (
            <div>
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Co myślisz o tej książce?"
                style={textarea}
              />
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <button onClick={submitReview} disabled={rating < 1 || savingReview}
                  style={{ ...saveReviewBtn, opacity: rating < 1 || savingReview ? 0.5 : 1 }}>
                  <Check size={15} /> {savingReview ? "…" : "Zapisz recenzję"}
                </button>
                {reviewBody && (
                  <button onClick={() => { setEditingReview(false); setDraft(reviewBody); }} style={cancelReviewBtn}>Anuluj</button>
                )}
              </div>
              {rating < 1 && <p style={hint}>Najpierw oceń książkę gwiazdkami, aby dodać recenzję.</p>}
            </div>
          ) : reviewBody ? (
            <div style={reviewBox}>
              <p style={reviewText}>{reviewBody}</p>
              <button onClick={() => setEditingReview(true)} style={editReviewBtn}><Edit3 size={13} /> Edytuj</button>
            </div>
          ) : (
            <p style={hint}>Najpierw oceń książkę gwiazdkami, aby dodać recenzję.</p>
          )}
        </div>
      </aside>
    </>
  );
}

const css = `
.drawer-backdrop { opacity: 0; transition: opacity .25s ease; }
.drawer-backdrop.open { opacity: 1; }
.drawer-panel { transform: translateX(100%); transition: transform .26s ease; }
.drawer-panel.open { transform: translateX(0); }
@media (max-width: 640px) {
  .drawer-panel { transform: translateY(100%); width: 100% !important; max-width: 100% !important; height: 92vh !important; top: auto !important; bottom: 0; border-radius: 22px 22px 0 0; }
  .drawer-panel.open { transform: translateY(0); }
}
`;

const backdrop: React.CSSProperties = { position: "fixed", inset: 0, background: "rgba(20,22,33,0.5)", zIndex: 60 };
const panel: React.CSSProperties = { position: "fixed", top: 0, right: 0, height: "100vh", width: 440, maxWidth: "92vw", background: PAPER, zIndex: 61, overflowY: "auto", boxShadow: "-16px 0 40px rgba(20,22,33,0.25)" };
const closeBtn: React.CSSProperties = { position: "absolute", top: 14, left: 14, width: 38, height: 38, borderRadius: "50%", background: "rgba(255,255,255,0.25)", border: "none", color: "#fff", display: "grid", placeItems: "center", cursor: "pointer", zIndex: 2, backdropFilter: "blur(4px)" };
const hero: React.CSSProperties = { padding: "36px 20px 30px", display: "flex", justifyContent: "center" };
const coverBox: React.CSSProperties = { width: 130, height: 195, borderRadius: "4px 8px 8px 4px", boxShadow: "0 14px 30px rgba(0,0,0,0.32)", overflow: "hidden" };
const coverFallback: React.CSSProperties = { width: "100%", height: "100%", padding: 14, color: "#fff", display: "flex", flexDirection: "column" };
const coverFallbackTitle: React.CSSProperties = { fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 600, lineHeight: 1.15 };
const body: React.CSSProperties = { padding: "22px 22px 40px" };
const titleStyle: React.CSSProperties = { fontFamily: "var(--font-display)", fontSize: 25, fontWeight: 600, margin: 0, lineHeight: 1.12, color: INK };
const authorStyle: React.CSSProperties = { fontSize: 15, color: MUTED, margin: "6px 0 0" };
const facts: React.CSSProperties = { display: "flex", flexWrap: "wrap", gap: 12, margin: "14px 0 4px" };
const fact: React.CSSProperties = { display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: MUTED };
const sectionLabel: React.CSSProperties = { fontSize: 12, letterSpacing: 1.2, textTransform: "uppercase", fontWeight: 700, color: BRASS, margin: "22px 0 10px" };
const statusPicker: React.CSSProperties = { display: "flex", flexWrap: "wrap", gap: 8 };
const statusOpt: React.CSSProperties = { display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 500, padding: "8px 12px", borderRadius: 999, border: "1px solid #D3C9B4", background: "#FBF7EC", color: MUTED, cursor: "pointer" };
const dot: React.CSSProperties = { width: 8, height: 8, borderRadius: "50%", flexShrink: 0 };
const starBtn: React.CSSProperties = { background: "none", border: "none", padding: 2, cursor: "pointer" };
const swapToggle: React.CSSProperties = { width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 22, padding: "13px", borderRadius: 12, border: "1px dashed #C4B896", background: "#FBF7EC", color: MUTED, fontSize: 14, fontWeight: 500, cursor: "pointer" };
const swapOn: React.CSSProperties = { background: "#C9A22722", borderColor: BRASS, borderStyle: "solid", color: "#7A5B00" };
const reviewBox: React.CSSProperties = { background: "#FBF7EC", border: "1px solid #E6DFCB", borderRadius: 14, padding: 16 };
const reviewText: React.CSSProperties = { fontSize: 15, lineHeight: 1.55, color: "#3A3527", margin: 0, fontStyle: "italic", whiteSpace: "pre-wrap" };
const editReviewBtn: React.CSSProperties = { marginTop: 10, background: "none", border: "none", color: BRASS, fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 5, cursor: "pointer", padding: 0 };
const textarea: React.CSSProperties = { width: "100%", minHeight: 100, border: "1px solid #D3C9B4", background: "#FBF7EC", borderRadius: 12, padding: 12, fontSize: 15, color: INK, fontFamily: "var(--font-body)", resize: "vertical", outline: "none", lineHeight: 1.5 };
const saveReviewBtn: React.CSSProperties = { display: "flex", alignItems: "center", gap: 6, background: FOREST, color: "#fff", border: "none", padding: "11px 18px", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer" };
const cancelReviewBtn: React.CSSProperties = { background: "transparent", border: "1px solid #D3C9B4", color: MUTED, padding: "11px 18px", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer" };
const hint: React.CSSProperties = { fontSize: 13, color: MUTED, marginTop: 10 };
