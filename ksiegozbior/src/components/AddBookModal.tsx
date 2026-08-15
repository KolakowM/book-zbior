"use client";

import { useState } from "react";
import { ScanLine, Check } from "lucide-react";
import { s } from "@/styles/shelf";
import { STATUSES, STATUS_KEYS } from "@/lib/statuses";
import { addBook } from "@/lib/actions/library";
import type { ReadingStatus } from "@/lib/types";

export default function AddBookModal({ onClose }: { onClose: () => void }) {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [status, setStatus] = useState<ReadingStatus>("want_to_read");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!title.trim()) return;
    setBusy(true);
    const fd = new FormData();
    fd.set("title", title);
    fd.set("author", author);
    fd.set("status", status);
    try {
      await addBook(fd);
      onClose();
    } catch (e) {
      setBusy(false);
      alert("Nie udało się dodać książki.");
    }
  };

  return (
    <div style={s.overlay} onClick={onClose}>
      <div style={s.sheet} onClick={(e) => e.stopPropagation()}>
        <div style={s.sheetHandle} />
        <h2 style={s.sheetTitle}>Dodaj książkę</h2>

        <button style={s.scanBtn} type="button" onClick={() => alert("Skaner ISBN dodamy w kolejnym kroku.")}>
          <ScanLine size={18} /> Zeskanuj kod ISBN
        </button>
        <div style={s.orLine}><span style={s.orText}>albo wpisz ręcznie</span></div>

        <label style={s.fieldLabel}>Tytuł</label>
        <input autoFocus style={s.field} value={title}
               onChange={(e) => setTitle(e.target.value)} placeholder="np. Solaris" />

        <label style={s.fieldLabel}>Autor</label>
        <input style={s.field} value={author}
               onChange={(e) => setAuthor(e.target.value)} placeholder="np. Stanisław Lem" />

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
                  type="button" disabled={busy} onClick={submit}>
            <Check size={16} /> {busy ? "…" : "Dodaj do półki"}
          </button>
        </div>
      </div>
    </div>
  );
}
