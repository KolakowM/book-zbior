import type { CSSProperties } from "react";
import type { LucideIcon } from "lucide-react";

const BONE2 = "#F3EFE4";
const INK = "#17251F";
const RUST = "#B0472A";
const MUTED = "#5A5B50";
const LINE = "#DAD4C2";

export default function SectionPlaceholder({
  title, description, icon: Icon, planned,
}: {
  title: string;
  description: string;
  icon: LucideIcon;
  planned: string[];
}) {
  return (
    <div style={styles.wrap}>
      <div style={styles.head}>
        <div style={styles.titleRow}>
          <Icon size={26} color={RUST} />
          <h1 style={styles.title}>{title}</h1>
        </div>
        <p style={styles.desc}>{description}</p>
        <span style={styles.badge}>W budowie</span>
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
  wrap: { maxWidth: 700, margin: "0 auto", padding: "56px 20px 120px", minHeight: "70vh" },
  head: { marginBottom: 34 },
  titleRow: { display: "flex", alignItems: "center", gap: 12 },
  title: { fontFamily: "var(--font-display)", fontSize: 36, fontWeight: 600, margin: 0, color: INK, lineHeight: 1.1 },
  desc: { fontSize: 17, lineHeight: 1.6, color: MUTED, margin: "14px 0 0", maxWidth: "56ch" },
  badge: { display: "inline-block", marginTop: 18, fontSize: 12, fontWeight: 600, letterSpacing: 0.5, color: RUST, background: "#F0E2DC", padding: "6px 14px", borderRadius: 999 },
  card: { background: BONE2, border: "1px solid " + LINE, borderRadius: 16, padding: 26 },
  cardHead: { fontSize: 12, letterSpacing: 1.5, textTransform: "uppercase", fontWeight: 700, color: MUTED, margin: "0 0 14px" },
  list: { listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 12 },
  li: { display: "flex", alignItems: "flex-start", gap: 10, fontSize: 15, color: INK, lineHeight: 1.5 },
  dot: { width: 7, height: 7, borderRadius: "50%", background: RUST, marginTop: 7, flexShrink: 0 },
};
