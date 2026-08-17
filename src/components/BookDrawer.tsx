"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from "react";
import { X, Star, Repeat, Calendar, BookOpen, Building2, Check, Edit3, ChevronDown } from "lucide-react";
import { STATUSES, STATUS_KEYS } from "@/lib/statuses";
import { updateStatus, updateRating, saveReview, toggleSwap, getBookExtras, updateDetails, lendBook, returnBook } from "@/lib/actions/library";
import Link from "next/link";
import type { LibraryItem, ReadingStatus } from "@/lib/types";

const PAPER = "#ECE7DA";
const INK = "#17251F";
const FOREST = "#153A2C";
const BRASS = "#B0472A";
const OCHRE = "#C0871B";
const MUTED = "#5A5B50";

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

  // Szczegóły egzemplarza
  const [showDetails, setShowDetails] = useState(false);
  const [price, setPrice] = useState(item.purchase_price != null ? String(item.purchase_price) : "");
  const [place, setPlace] = useState(item.purchase_location ?? "");
  const [buyDate, setBuyDate] = useState(item.purchase_date ?? "");
  const [page, setPage] = useState(item.current_page != null ? String(item.current_page) : "");
  const [readDate, setReadDate] = useState(item.read_date ?? "");
  const [notes, setNotes] = useState(item.private_notes ?? "");
  const [savingDetails, setSavingDetails] = useState(false);
  const [savedDetails, setSavedDetails] = useState(false);

  // Pożyczka
  const [loan, setLoan] = useState<{ id: string; borrower_name: string | null; expected_return: string | null } | null>(null);
  const [borrower, setBorrower] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [loanBusy, setLoanBusy] = useState(false);

  const color = item.book.cover_color ?? "#3D4A6B";
  const cover = item.book.cover_image_url;

  useEffect(() => {
    setShow(true);
    getBookExtras(item.id, item.book_id).then((x) => {
      setReviewBody(x.reviewBody);
      setDraft(x.reviewBody);
      setForExchange(x.forExchange);
      setLoan(x.loan);
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
    toggleSwap(item.id, next, item.book_id).catch((e) => {
      setForExchange(!next);
      alert("Nie udało się zmienić statusu wymiany: " + (e?.message || "błąd zapisu. Sprawdź, czy migracja 04 została uruchomiona."));
    });
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

  const saveDetails = async () => {
    setSavingDetails(true);
    setSavedDetails(false);
    const priceNum = Number(price.replace(",", "."));
    const pageNum = parseInt(page, 10);
    try {
      await updateDetails(item.id, {
        purchase_price: price.trim() && Number.isFinite(priceNum) ? priceNum : null,
        purchase_location: place.trim() || null,
        purchase_date: buyDate || null,
        current_page: page.trim() && Number.isFinite(pageNum) ? pageNum : null,
        read_date: readDate || null,
        private_notes: notes.trim() || null,
      });
      setSavedDetails(true);
      setTimeout(() => setSavedDetails(false), 2000);
    } catch {
      alert("Nie udało się zapisać szczegółów.");
    } finally {
      setSavingDetails(false);
    }
  };

  const doLend = async () => {
    setLoanBusy(true);
    try {
      await lendBook(item.id, borrower, dueDate || null);
      setLoan({ id: "tmp", borrower_name: borrower.trim() || "—", expected_return: dueDate || null });
      setBorrower("");
      setDueDate("");
    } catch {
      alert("Nie udało się zapisać pożyczki.");
    } finally {
      setLoanBusy(false);
    }
  };

  const doReturn = async () => {
    setLoanBusy(true);
    try {
      await returnBook(item.id);
      setLoan(null);
    } catch {
      alert("Nie udało się oznaczyć zwrotu.");
    } finally {
      setLoanBusy(false);
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
                <Star size={30} fill={n <= rating ? "#C0871B" : "none"} color={n <= rating ? "#C0871B" : "#C7BE9E"} strokeWidth={1.4} />
              </button>
            ))}
          </div>

          {/* Wymiana */}
          <button onClick={flipSwap} style={{ ...swapToggle, ...(forExchange ? swapOn : {}) }}>
            <Repeat size={16} />
            {forExchange ? "Dostępna do wymiany — kliknij, aby wycofać" : "Oznacz jako dostępną do wymiany"}
          </button>

          {/* Szczegóły egzemplarza */}
          <button onClick={() => setShowDetails((v) => !v)} style={detailsToggle}>
            <span>Szczegóły egzemplarza</span>
            <ChevronDown size={16} style={{ transform: showDetails ? "rotate(180deg)" : "none", transition: "transform .2s" }} />
          </button>
          {showDetails && (
            <div style={detailsWrap}>
              <div style={detailsRow}>
                <div style={{ flex: 1 }}>
                  <label style={miniLabel}>Cena (zł)</label>
                  <input style={miniField} inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="np. 39,90" />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={miniLabel}>Data zakupu</label>
                  <input style={miniField} type="date" value={buyDate} onChange={(e) => setBuyDate(e.target.value)} />
                </div>
              </div>
              <label style={miniLabel}>Miejsce zakupu</label>
              <input style={miniField} value={place} onChange={(e) => setPlace(e.target.value)} placeholder="np. Empik, antykwariat, Allegro" />
              <div style={detailsRow}>
                <div style={{ flex: 1 }}>
                  <label style={miniLabel}>Postęp — strona{item.book.page_count ? ` z ${item.book.page_count}` : ""}</label>
                  <input style={miniField} inputMode="numeric" value={page} onChange={(e) => setPage(e.target.value)} placeholder="0" />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={miniLabel}>Data przeczytania</label>
                  <input style={miniField} type="date" value={readDate} onChange={(e) => setReadDate(e.target.value)} />
                </div>
              </div>
              <label style={miniLabel}>Prywatne notatki</label>
              <textarea style={{ ...textarea, minHeight: 70 }} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Tylko dla Ciebie…" />
              <button onClick={saveDetails} disabled={savingDetails} style={{ ...saveReviewBtn, marginTop: 8, opacity: savingDetails ? 0.6 : 1 }}>
                <Check size={15} /> {savingDetails ? "…" : savedDetails ? "Zapisano" : "Zapisz szczegóły"}
              </button>
            </div>
          )}

          {/* Pożyczka */}
          <div style={sectionLabel}>Pożyczka</div>
          {loan ? (
            <div style={loanActive}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: INK }}>Pożyczona: {loan.borrower_name || "—"}</div>
                {loan.expected_return && <div style={{ fontSize: 12, color: MUTED, marginTop: 2 }}>Zwrot do {loan.expected_return}</div>}
              </div>
              <button onClick={doReturn} disabled={loanBusy} style={loanReturnBtn}>Zwrócona</button>
            </div>
          ) : (
            <div style={loanForm}>
              <div style={{ display: "flex", gap: 10 }}>
                <div style={{ flex: 1.4 }}>
                  <label style={miniLabel}>Komu</label>
                  <input style={miniField} value={borrower} onChange={(e) => setBorrower(e.target.value)} placeholder="imię lub nazwa" />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={miniLabel}>Zwrot do</label>
                  <input style={miniField} type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
                </div>
              </div>
              <button onClick={doLend} disabled={loanBusy || !borrower.trim()} style={{ ...saveReviewBtn, opacity: borrower.trim() && !loanBusy ? 1 : 0.5 }}>
                <Check size={15} /> Zapisz pożyczkę
              </button>
            </div>
          )}

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

          <Link href={`/ksiazka/${item.book_id}`} style={publicLink}>
            Zobacz publiczną stronę książki →
          </Link>
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
const statusOpt: React.CSSProperties = { display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 500, padding: "8px 12px", borderRadius: 999, border: "1px solid #D3C9B4", background: "#F3EFE4", color: MUTED, cursor: "pointer" };
const dot: React.CSSProperties = { width: 8, height: 8, borderRadius: "50%", flexShrink: 0 };
const starBtn: React.CSSProperties = { background: "none", border: "none", padding: 2, cursor: "pointer" };
const swapToggle: React.CSSProperties = { width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 22, padding: "13px", borderRadius: 12, border: "1px dashed #C7BE9E", background: "#F3EFE4", color: MUTED, fontSize: 14, fontWeight: 500, cursor: "pointer" };
const swapOn: React.CSSProperties = { background: "#C0871B22", borderColor: BRASS, borderStyle: "solid", color: "#7A5B00" };
const reviewBox: React.CSSProperties = { background: "#F3EFE4", border: "1px solid #DAD4C2", borderRadius: 14, padding: 16 };
const reviewText: React.CSSProperties = { fontSize: 15, lineHeight: 1.55, color: "#3A3527", margin: 0, fontStyle: "italic", whiteSpace: "pre-wrap" };
const editReviewBtn: React.CSSProperties = { marginTop: 10, background: "none", border: "none", color: BRASS, fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 5, cursor: "pointer", padding: 0 };
const textarea: React.CSSProperties = { width: "100%", minHeight: 100, border: "1px solid #D3C9B4", background: "#F3EFE4", borderRadius: 12, padding: 12, fontSize: 15, color: INK, fontFamily: "var(--font-body)", resize: "vertical", outline: "none", lineHeight: 1.5 };
const saveReviewBtn: React.CSSProperties = { display: "flex", alignItems: "center", gap: 6, background: FOREST, color: "#fff", border: "none", padding: "11px 18px", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer" };
const cancelReviewBtn: React.CSSProperties = { background: "transparent", border: "1px solid #D3C9B4", color: MUTED, padding: "11px 18px", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer" };
const hint: React.CSSProperties = { fontSize: 13, color: MUTED, marginTop: 10 };
const detailsToggle: React.CSSProperties = { width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 22, padding: "13px 14px", borderRadius: 12, border: "1px solid #DAD4C2", background: "#F3EFE4", color: INK, fontSize: 14, fontWeight: 600, cursor: "pointer" };
const detailsWrap: React.CSSProperties = { marginTop: 10, padding: 16, borderRadius: 14, border: "1px solid #DAD4C2", background: "#F3EFE4" };
const detailsRow: React.CSSProperties = { display: "flex", gap: 10 };
const miniLabel: React.CSSProperties = { display: "block", fontSize: 11, fontWeight: 600, color: MUTED, margin: "0 0 5px" };
const miniField: React.CSSProperties = { width: "100%", border: "1px solid #DAD4C2", background: PAPER, borderRadius: 8, padding: "9px 10px", fontSize: 14, color: INK, marginBottom: 12, outline: "none", fontFamily: "var(--font-body)" };
const loanActive: React.CSSProperties = { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, background: "#F3EFE4", border: "1px solid #DAD4C2", borderRadius: 12, padding: 14 };
const loanReturnBtn: React.CSSProperties = { background: FOREST, color: "#fff", border: "none", padding: "9px 14px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", flexShrink: 0 };
const loanForm: React.CSSProperties = { background: "#F3EFE4", border: "1px solid #DAD4C2", borderRadius: 12, padding: 14 };
const publicLink: React.CSSProperties = { display: "block", marginTop: 28, fontSize: 14, fontWeight: 600, color: BRASS, textDecoration: "none" };
