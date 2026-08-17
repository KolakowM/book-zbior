"use client";

import { useState, useEffect, useRef } from "react";
import { Check, Search, Loader2 } from "lucide-react";
import { s } from "@/styles/shelf";
import { STATUSES, STATUS_KEYS } from "@/lib/statuses";
import { addBook } from "@/lib/actions/library";
import type { ReadingStatus } from "@/lib/types";

type Lookup = "idle" | "loading" | "found" | "notfound";
type Result = { title: string; author: string; year: number | null; pages: number | null; isbn13: string | null; isbn10: string | null };

export default function AddBookModal({ onClose }: { onClose: () => void }) {
  const [searchQ, setSearchQ] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [searching, setSearching] = useState(false);
  const skipRef = useRef(false);

  const [isbn, setIsbn] = useState("");
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [year, setYear] = useState("");
  const [pages, setPages] = useState("");
  const [publisher, setPublisher] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [isbn13, setIsbn13] = useState("");
  const [isbn10, setIsbn10] = useState("");
  const [status, setStatus] = useState<ReadingStatus>("want_to_read");
  const [lookup, setLookup] = useState<Lookup>("idle");
  const [busy, setBusy] = useState(false);

  // Podpowiedzi po tytule (debounce)
  useEffect(() => {
    if (skipRef.current) { skipRef.current = false; return; }
    const q = searchQ.trim();
    if (q.length < 3) { setResults([]); return; }
    const t = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        setResults(data.results || []);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 350);
    return () => clearTimeout(t);
  }, [searchQ]);

  const fillFrom = (b: any) => {
    setTitle(b.title ?? "");
    setAuthor(b.author ?? "");
    setYear(b.year ? String(b.year) : "");
    setPages(b.pages ? String(b.pages) : "");
    setPublisher(b.publisher ?? "");
    setCoverUrl(b.coverUrl ?? "");
    setIsbn13(b.isbn13 ?? "");
    setIsbn10(b.isbn10 ?? "");
  };

  const pick = async (r: Result) => {
    skipRef.current = true;
    setSearchQ(r.title);
    setResults([]);
    const code = r.isbn13 || r.isbn10;
    if (code) {
      setIsbn(code);
      setLookup("loading");
      try {
        const res = await fetch(`/api/isbn?isbn=${encodeURIComponent(code)}`);
        const data = await res.json();
        if (data.found) { fillFrom(data.book); setLookup("found"); return; }
      } catch { /* spadamy do danych z podpowiedzi */ }
    }
    fillFrom({ title: r.title, author: r.author, year: r.year, pages: r.pages, isbn13: r.isbn13, isbn10: r.isbn10 });
    setLookup("found");
  };

  const doLookup = async () => {
    if (!isbn.trim()) return;
    setLookup("loading");
    try {
      const res = await fetch(`/api/isbn?isbn=${encodeURIComponent(isbn.trim())}`);
      const data = await res.json();
      if (data.found) { fillFrom(data.book); setLookup("found"); }
      else setLookup("notfound");
    } catch {
      setLookup("notfound");
    }
  };

  const submit = async () => {
    if (!title.trim()) return;
    setBusy(true);
    const cleaned = isbn.replace(/[^0-9Xx]/g, "");
    const fd = new FormData();
    fd.set("title", title);
    fd.set("author", author);
    fd.set("status", status);
    fd.set("year", year);
    fd.set("pages", pages);
    fd.set("publisher", publisher);
    fd.set("coverUrl", coverUrl);
    fd.set("isbn13", isbn13 || (cleaned.length === 13 ? cleaned : ""));
    fd.set("isbn10", isbn10 || (cleaned.length === 10 ? cleaned : ""));
    try {
      await addBook(fd);
      onClose();
    } catch {
      setBusy(false);
      alert("Nie udało się dodać książki.");
    }
  };

  return (
    <div style={s.overlay} onClick={onClose}>
      <div style={{ ...s.sheet, maxHeight: "88vh", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
        <div style={s.sheetHandle} />
        <h2 style={s.sheetTitle}>Dodaj książkę</h2>

        {/* Wyszukiwanie po tytule */}
        <label style={s.fieldLabel}>Szukaj po tytule</label>
        <div style={{ position: "relative", marginBottom: 6 }}>
          <div style={{ ...s.searchWrap, marginTop: 0, maxWidth: "none", background: "#F3EFE4", border: "1px solid #DAD4C2" }}>
            <Search size={16} color="#8A7E64" />
            <input
              style={s.search}
              value={searchQ}
              onChange={(e) => setSearchQ(e.target.value)}
              placeholder="np. Solaris, Zbrodnia i kara…"
            />
            {searching && <Loader2 size={16} className="spin" color="#8A7E64" />}
          </div>
          {results.length > 0 && (
            <div style={suggBox}>
              {results.map((r, i) => (
                <button key={i} type="button" style={suggItem} onClick={() => pick(r)}>
                  <div style={suggTitle}>{r.title}</div>
                  <div style={suggMeta}>{r.author || "autor nieznany"}{r.year ? ` · ${r.year}` : ""}</div>
                </button>
              ))}
            </div>
          )}
        </div>
        <p style={{ fontSize: 11, color: "#A99C82", margin: "2px 0 14px" }}>
          Wpisz min. 3 znaki. Podpowiedzi z Biblioteki Narodowej.
        </p>

        <div style={s.orLine}><span style={s.orText}>albo po numerze ISBN</span></div>

        <label style={s.fieldLabel}>Numer ISBN</label>
        <div style={{ display: "flex", gap: 8, marginBottom: 6 }}>
          <input
            style={{ ...s.field, marginBottom: 0, flex: 1 }}
            value={isbn}
            onChange={(e) => setIsbn(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") doLookup(); }}
            placeholder="np. 9788375780635"
            inputMode="numeric"
          />
          <button
            type="button"
            onClick={doLookup}
            disabled={lookup === "loading" || !isbn.trim()}
            style={{ ...s.scanBtn, width: "auto", padding: "0 18px", opacity: isbn.trim() ? 1 : 0.5 }}
          >
            {lookup === "loading" ? <Loader2 size={18} className="spin" /> : <Search size={18} />}
            Pobierz
          </button>
        </div>

        {lookup === "found" && (
          <div style={foundBox}>
            {coverUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={coverUrl} alt={title} style={{ width: 44, height: 62, objectFit: "cover", borderRadius: 4, flexShrink: 0 }} />
            ) : null}
            <div>
              <div style={{ fontWeight: 600, fontSize: 14, color: "#17251F" }}>{title || "Bez tytułu"}</div>
              <div style={{ fontSize: 12, color: "#6C6A5C", marginTop: 2 }}>
                {author || "autor nieznany"}{year ? ` · ${year}` : ""}{pages ? ` · ${pages} s.` : ""}
              </div>
            </div>
          </div>
        )}
        {lookup === "notfound" && (
          <p style={notFoundNote}>
            Nie znaleźliśmy tej książki. Zapiszemy sam numer ISBN — resztę uzupełnij ręcznie poniżej.
          </p>
        )}

        <div style={s.orLine}><span style={s.orText}>dane książki</span></div>

        <label style={s.fieldLabel}>Tytuł</label>
        <input style={s.field} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="np. Solaris" />

        <label style={s.fieldLabel}>Autor</label>
        <input style={s.field} value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="np. Stanisław Lem" />

        <label style={s.fieldLabel}>Status</label>
        <div style={s.statusPicker}>
          {STATUS_KEYS.map((k) => (
            <button key={k} type="button" onClick={() => setStatus(k)}
              style={{ ...s.statusOpt, ...(status === k ? { borderColor: STATUSES[k].dot, background: STATUSES[k].dot + "18" } : {}) }}>
              <span style={{ ...s.statusDot, background: STATUSES[k].dot }} />
              {STATUSES[k].label}
            </button>
          ))}
        </div>

        <div style={s.sheetActions}>
          <button style={s.btnGhost} type="button" onClick={onClose}>Anuluj</button>
          <button style={{ ...s.btnPrimary, opacity: title.trim() && !busy ? 1 : 0.5 }}
                  type="button" disabled={busy || !title.trim()} onClick={submit}>
            <Check size={16} /> {busy ? "…" : "Dodaj do półki"}
          </button>
        </div>

        <style>{`.spin { animation: spin 0.9s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}

const foundBox: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: 12, background: "#EDF2EE",
  border: "1px solid #CFE0D6", borderRadius: 12, padding: 12, marginBottom: 14,
};
const notFoundNote: React.CSSProperties = {
  fontSize: 13, color: "#7A5B00", background: "#F3E7C8",
  border: "1px solid #E9D9A6", borderRadius: 10, padding: 12, margin: "0 0 14px", lineHeight: 1.5,
};
const suggBox: React.CSSProperties = {
  position: "absolute", top: "100%", left: 0, right: 0, zIndex: 5, marginTop: 4,
  background: "#F3EFE4", border: "1px solid #DAD4C2", borderRadius: 12, overflow: "hidden",
  boxShadow: "0 12px 28px rgba(23,37,31,0.18)", maxHeight: 280, overflowY: "auto",
};
const suggItem: React.CSSProperties = {
  display: "block", width: "100%", textAlign: "left", background: "transparent",
  border: "none", borderBottom: "1px solid #E4DECD", padding: "11px 14px", cursor: "pointer",
};
const suggTitle: React.CSSProperties = { fontSize: 14, fontWeight: 600, color: "#17251F", lineHeight: 1.2 };
const suggMeta: React.CSSProperties = { fontSize: 12, color: "#6C6A5C", marginTop: 2 };
