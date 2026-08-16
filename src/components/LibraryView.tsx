"use client";

import { useMemo, useState } from "react";
import { Search, X, Plus, BookOpen, User } from "lucide-react";
import { s } from "@/styles/shelf";
import BookCard from "./BookCard";
import AddBookModal from "./AddBookModal";
import BookDrawer from "./BookDrawer";
import type { LibraryItem, ReadingStatus } from "@/lib/types";

const FILTERS: { key: "all" | ReadingStatus; label: string }[] = [
  { key: "all", label: "Wszystkie" },
  { key: "reading", label: "W trakcie" },
  { key: "read", label: "Przeczytane" },
  { key: "want_to_read", label: "Do przeczytania" },
  { key: "abandoned", label: "Porzucone" },
];

export default function LibraryView({ items }: { items: LibraryItem[] }) {
  const [filter, setFilter] = useState<"all" | ReadingStatus>("all");
  const [query, setQuery] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = useMemo(
    () =>
      items.filter((it) => {
        const q = (it.book.title + " " + it.book.author).toLowerCase().includes(query.toLowerCase());
        const f = filter === "all" ? true : it.reading_status === filter;
        return q && f;
      }),
    [items, filter, query]
  );

  const readCount = items.filter((i) => i.reading_status === "read").length;
  const selected = selectedId ? items.find((i) => i.id === selectedId) ?? null : null;

  return (
    <div style={s.page}>
      <header style={s.header}>
        <div style={s.headerTop}>
          <div>
            <div style={s.eyebrow}>MOJA PÓŁKA</div>
            <h1 style={s.h1}>Biblioteczka</h1>
          </div>
          <a href="/" style={s.avatarBtn} aria-label="Strona główna"><User size={18} /></a>
        </div>

        <div style={s.statsRow}>
          <div style={s.stat}><span style={s.statNum}>{items.length}</span><span style={s.statLbl}>pozycji</span></div>
          <div style={s.statDivide} />
          <div style={s.stat}><span style={s.statNum}>{readCount}</span><span style={s.statLbl}>przeczytane</span></div>
        </div>

        <div style={s.searchWrap}>
          <Search size={16} color="#8A7E64" />
          <input style={s.search} placeholder="Szukaj w swojej biblioteczce"
                 value={query} onChange={(e) => setQuery(e.target.value)} />
          {query && <button style={s.clearBtn} onClick={() => setQuery("")}><X size={15} /></button>}
        </div>

        <div style={s.filters}>
          {FILTERS.map((f) => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              style={{ ...s.chip, ...(filter === f.key ? s.chipActive : {}) }}>{f.label}</button>
          ))}
        </div>
      </header>

      <main style={s.main}>
        {filtered.length === 0 ? (
          <div style={s.empty}>
            <BookOpen size={32} color="#B8AC93" strokeWidth={1.5} />
            <p style={s.emptyText}>{query ? "Nic nie pasuje." : "Nic tu jeszcze nie stoi."}</p>
            <p style={s.emptySub}>{query ? "Spróbuj innej frazy." : "Dodaj pierwszą książkę przyciskiem poniżej."}</p>
          </div>
        ) : (
          <div style={s.grid}>
            {filtered.map((it) => <BookCard key={it.id} item={it} onOpen={() => setSelectedId(it.id)} />)}
          </div>
        )}
      </main>

      <button style={s.fab} onClick={() => setShowAdd(true)}>
        <Plus size={20} strokeWidth={2.4} /> Dodaj
      </button>

      {showAdd && <AddBookModal onClose={() => setShowAdd(false)} />}
      {selected && <BookDrawer item={selected} onClose={() => setSelectedId(null)} />}
    </div>
  );
}
