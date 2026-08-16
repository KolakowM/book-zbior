"use client";

/* eslint-disable @next/next/no-img-element */
import { Star, Trash2, Repeat } from "lucide-react";
import { s } from "@/styles/shelf";
import { STATUSES } from "@/lib/statuses";
import { removeBook } from "@/lib/actions/library";
import type { LibraryItem } from "@/lib/types";

export default function BookCard({ item, onOpen }: { item: LibraryItem; onOpen: (item: LibraryItem) => void }) {
  const st = STATUSES[item.reading_status];
  const color = item.book.cover_color ?? "#3D4A6B";
  const cover = item.book.cover_image_url;
  const forExchange = item.physical_state === "on_exchange";

  const progress =
    item.reading_status === "reading" && item.current_page != null && item.book.page_count
      ? Math.min(100, (item.current_page / item.book.page_count) * 100)
      : null;

  return (
    <div style={s.card}>
      <div style={{ ...s.cardInner, cursor: "pointer" }} onClick={() => onOpen(item)}>
        <div style={{ ...s.spine, background: st.spine }}>
          <span style={s.spineText}>{item.book.title}</span>
        </div>
        <div style={{ ...s.cover, background: `linear-gradient(150deg, ${color}, ${color}CC)` }}>
          {cover ? (
            <img
              src={cover}
              alt={item.book.title}
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <>
              <div style={s.coverGloss} />
              <div style={s.coverTitle}>{item.book.title}</div>
              <div style={s.coverAuthor}>{item.book.author}</div>
            </>
          )}
          {forExchange && (
            <div style={swapBadge} title="Dostępna do wymiany">
              <Repeat size={11} strokeWidth={2.5} />
            </div>
          )}
          {progress != null && (
            <div style={{ ...s.progressWrap, position: "relative", zIndex: 2 }}>
              <div style={{ ...s.progressBar, width: `${progress}%` }} />
            </div>
          )}
        </div>
      </div>

      <div style={s.meta}>
        <div style={s.metaTop}>
          <span style={{ ...s.statusDot, background: st.dot }} />
          <span style={s.statusLabel}>{st.label}</span>
        </div>
        {item.user_rating ? (
          <div style={s.stars}>
            {[1, 2, 3, 4, 5].map((n) => (
              <Star key={n} size={11}
                    fill={n <= item.user_rating! ? "#C9A227" : "none"}
                    color={n <= item.user_rating! ? "#C9A227" : "#B8AC93"} strokeWidth={1.5} />
            ))}
          </div>
        ) : null}
        <button style={s.delBtn} onClick={() => removeBook(item.id)}>
          <Trash2 size={12} /> Usuń
        </button>
      </div>
    </div>
  );
}

const swapBadge: React.CSSProperties = {
  position: "absolute", top: 10, right: 10, width: 22, height: 22, borderRadius: "50%",
  background: "#C9A227", color: "#20303A", display: "grid", placeItems: "center", zIndex: 3,
  boxShadow: "0 2px 6px rgba(0,0,0,0.25)",
};
