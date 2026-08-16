"use client";

import { useState } from "react";
import { Check, Search, Loader2 } from "lucide-react";
import { s } from "@/styles/shelf";
import { STATUSES, STATUS_KEYS } from "@/lib/statuses";
import { addBook } from "@/lib/actions/library";
import type { ReadingStatus } from "@/lib/types";

type Lookup = "idle" | "loading" | "found" | "notfound";

export default function AddBookModal({ onClose }: { onClose: () => void }) {
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

  const doLookup = async () => {
    if (!isbn.trim()) return;
    setLookup("loading");
    try {
      const res = await fetch(`/api/isbn?isbn=${encodeURIComponent(isbn.trim())}`);
      const data = await res.json();
      if (data.found) {
        const b = data.book;
        setTitle(b.title ?? "");
        setAuthor(b.author ?? "");
        setYear(b.year ? String(b.year) : "");
        setPages(b.pages ? String(b.pages) : "");
        setPublisher(b.publisher ?? "");
        setCoverUrl(b.coverUrl ?? "");
        setIsbn13(b.isbn13 ?? "");
        setIsbn10(b.isbn10 ?? "");
        setLookup("found");
      } else {
        setLookup("notfound");
      }
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
            Nie znaleźliśmy tej książki w Open Library. Zapiszemy sam numer ISBN — resztę uzupełnij ręcznie poniżej.
          </p>
        )}

        <p style={{ fontSize: 11, color: "#A99C82", margin: "2px 0 14px" }}>
          Skanowanie kodu aparatem dodamy wkrótce.
        </p>

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
  display: "flex", alignItems: "center", gap: 12, background: "#EEF4F0",
  border: "1px solid #CFE0D6", borderRadius: 12, padding: 12, marginBottom: 14,
};
const notFoundNote: React.CSSProperties = {
  fontSize: 13, color: "#7A5B00", background: "#FBF3DA",
  border: "1px solid #E9D9A6", borderRadius: 10, padding: 12, margin: "0 0 14px", lineHeight: 1.5,
};
