import type { CSSProperties } from "react";
import type { LucideIcon } from "lucide-react";

const PAPER = "#F4EEE0";
const CARD = "#FBF7EC";
const INK = "#20303A";
const FOREST = "#2F5D50";
const BRASS = "#B88A2E";
const MUTED = "#6C6A5C";

export default function SectionPlaceholder({
  eyebrow, title, description, icon: Icon, planned,
}: {
  eyebrow: string;
  title: string;
  description: string;
  icon: LucideIcon;
  planned: string[];
}) {
  return (
    <div style={styles.wrap}>
      <div style={styles.head}>
        <div style={styles.iconWrap}><Icon size={26} color={FOREST} /></div>
        <span style={styles.eyebrow}>{eyebrow}</span>
        <h1 style={styles.title}>{title}</h1>
        <p style={styles.desc}>{description}</p>
        <span style={styles.badge}>Wkrótce</span>
      </div>

      <div style={styles.card}>
        <p style={styles.cardHead}>Co tu powstanie</p>
        <ul style={styles.list}>
          {planned.map((p) => (
            <li key={p} style={styles.li}><span style={styles.dot} />{p}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  wrap: { maxWidth: 720, margin: "0 auto", padding: "48px 20px 120px", minHeight: "70vh" },
  head: { textAlign: "center", marginBottom: 32 },
  iconWrap: { width: 60, height: 60, borderRadius: 16, background: `${FOREST}14`, display: "grid", placeItems: "center", margin: "0 auto 18px" },
  eyebrow: { fontSize: 12, fontWeight: 700, letterSpacing: 2, color: BRASS },
  title: { fontFamily: "var(--font-display)", fontSize: 34, fontWeight: 600, margin: "10px 0 0", color: INK },
  desc: { fontSize: 16, lineHeight: 1.6, color: MUTED, margin: "12px auto 0", maxWidth: 480 },
  badge: { display: "inline-block", marginTop: 18, fontSize: 12, fontWeight: 600, letterSpacing: 0.5, color: BRASS, background: `${BRASS}18`, padding: "6px 14px", borderRadius: 999 },
  card: { background: CARD, border: "1px solid #E6DFCB", borderRadius: 18, padding: 26 },
  cardHead: { fontSize: 12, letterSpacing: 1.5, textTransform: "uppercase", fontWeight: 700, color: MUTED, margin: "0 0 14px" },
  list: { listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 12 },
  li: { display: "flex", alignItems: "flex-start", gap: 10, fontSize: 15, color: INK, lineHeight: 1.5 },
  dot: { width: 7, height: 7, borderRadius: "50%", background: FOREST, marginTop: 7, flexShrink: 0 },
};
