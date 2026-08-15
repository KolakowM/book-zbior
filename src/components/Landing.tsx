import Link from "next/link";
import type { CSSProperties } from "react";
import {
  BookMarked, Barcode, MapPin, BarChart3, Star, ArrowRight, Search, Quote,
} from "lucide-react";

const PAPER = "#F4EEE0";
const CARD = "#FBF7EC";
const INK = "#20303A";
const FOREST = "#2F5D50";
const BRASS = "#B88A2E";
const MUTED = "#6C6A5C";

const SPINES = ["#3D4A6B", "#6B3A3A", "#4A5D3A", "#5C4A6B", "#2F5D50", "#7A4A2A"];
const SPINE_TITLES = ["Solaris", "Lód", "Bieguni", "Diuna", "Cyberiada", "Ślepnąc od świateł"];

const FEATURES = [
  { icon: Barcode, title: "Kataloguj po ISBN", text: "Zeskanuj kod przy regale — zapisujemy okładkę, autora, wydawcę i Twoją cenę zakupu." },
  { icon: Star, title: "Recenzuj i oceniaj", text: "Wystawiaj gwiazdki, pisz recenzje i zobacz średnią ocen społeczności przy każdym tytule." },
  { icon: MapPin, title: "Wymieniaj w okolicy", text: "Oznacz książkę do wymiany. Spotkajcie się osobiście — bez pośrednictwa i prowizji." },
  { icon: BarChart3, title: "Śledź postępy", text: "Wyzwanie roczne, wydatki miesięczne, ulubieni autorzy i gatunki oraz podsumowanie roku." },
];

const AUDIENCE = [
  { emoji: "📚", title: "Kolekcjonerzy", text: "Masz setki książek i chcesz w końcu wiedzieć, co dokładnie stoi na półce i ile Cię kosztowało." },
  { emoji: "🔖", title: "Mole książkowe", text: "Czytasz dużo i lubisz śledzić postępy, oceny i statystyki swojej pasji." },
  { emoji: "🤝", title: "Wymieniacze", text: "Nadmiar półki wolisz wymienić z sąsiadem niż wyrzucić — lokalnie i bez opłat." },
];

function Spine({ color, title, h }: { color: string; title: string; h: number }) {
  return (
    <div style={{ width: 26, height: h, background: `linear-gradient(180deg, ${color}, ${color}D0)`,
      borderRadius: "3px 3px 1px 1px", display: "flex", alignItems: "center", justifyContent: "center",
      boxShadow: "inset -3px 0 6px rgba(0,0,0,0.25), inset 2px 0 3px rgba(255,255,255,0.15)" }}>
      <span style={{ writingMode: "vertical-rl", transform: "rotate(180deg)", fontSize: 9,
        color: "rgba(255,255,255,0.85)", fontWeight: 600, letterSpacing: 0.4, whiteSpace: "nowrap",
        overflow: "hidden", maxHeight: h - 16, textOverflow: "ellipsis" }}>{title}</span>
    </div>
  );
}

export default function Landing({ isLoggedIn }: { isLoggedIn: boolean }) {
  return (
    <div className="landing" style={styles.app}>
      <style>{css}</style>

      {/* NAV */}
      <header style={styles.nav}>
        <div style={styles.navInner}>
          <Link href="/" style={styles.logo}>
            <BookMarked size={22} color={FOREST} />
            <span style={styles.logoText}>Księgozbiór</span>
          </Link>
          <nav className="nav-links" style={styles.navLinks}>
            <a href="#funkcje" style={styles.navLink}>Funkcje</a>
            <a href="#dla-kogo" style={styles.navLink}>Dla kogo</a>
            <a href="#misja" style={styles.navLink}>Nasza misja</a>
          </nav>
          <div style={styles.navCta}>
            {isLoggedIn ? (
              <Link href="/biblioteka" style={styles.navBtn}>Moja biblioteka</Link>
            ) : (
              <>
                <Link href="/login" style={styles.navGhost}>Zaloguj się</Link>
                <Link href="/login" style={styles.navBtn}>Załóż konto</Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* HERO */}
      <section style={styles.hero}>
        <div style={styles.heroGlow} />
        <div className="hero-grid" style={styles.heroGrid}>
          <div>
            <span style={styles.badge}>Biblioteka · Recenzje · Wymiana</span>
            <h1 style={styles.h1}>
              Twoja domowa biblioteka<br />
              <span style={{ color: FOREST }}>wreszcie policzona</span>
            </h1>
            <p style={styles.lead}>
              Zapisuj, co czytasz i za ile kupiłeś, pisz recenzje, pilnuj pożyczonych
              egzemplarzy, a nadmiar półki wymieniaj z czytelnikami z sąsiedztwa.
            </p>

            <div style={styles.heroCtas}>
              <Link href={isLoggedIn ? "/biblioteka" : "/login"} style={styles.btnPrimary}>
                {isLoggedIn ? "Otwórz moją bibliotekę" : "Załóż darmowy księgozbiór"}
              </Link>
              <a href="#funkcje" style={styles.btnOutline}>Zobacz, co potrafi <ArrowRight size={16} /></a>
            </div>

            <div style={styles.searchCard}>
              <p style={styles.searchLabel}>SPRAWDŹ KSIĄŻKĘ BEZ REJESTRACJI</p>
              <div className="search-row" style={styles.searchRow}>
                <div style={styles.searchInputWrap}>
                  <Search size={16} color={MUTED} />
                  <input style={styles.searchInput} placeholder="Tytuł, autor lub ISBN…" />
                </div>
                <button style={styles.searchBtn}>Szukaj</button>
              </div>
              <p style={styles.searchHint}>Dane książek z otwartej bazy Open Library.</p>
            </div>
          </div>

          <div style={styles.heroVisual}>
            <div style={styles.shelfWrap}>
              <div style={styles.shelfRow}>
                {SPINES.map((c, i) => (
                  <Spine key={i} color={c} title={SPINE_TITLES[i]} h={150 + ((i * 37) % 40)} />
                ))}
              </div>
              <div style={styles.plank} />
            </div>
            <div style={styles.statCard}>
              <div style={styles.statItem}><div style={styles.statNum}>18/25</div><div style={styles.statLbl}>wyzwanie 2026</div></div>
              <div style={styles.statDiv} />
              <div style={styles.statItem}><div style={styles.statNum}>1 284</div><div style={styles.statLbl}>wymiany w miesiącu</div></div>
              <div style={styles.statDiv} />
              <div style={styles.statItem}><div style={styles.statNum}>4,9</div><div style={styles.statLbl}>ocena wymian</div></div>
            </div>
          </div>
        </div>
      </section>

      {/* FUNKCJE */}
      <section id="funkcje" style={styles.section}>
        <div style={styles.sectionHead}>
          <span style={styles.eyebrow}>CO MOŻESZ U NAS ZROBIĆ</span>
          <h2 style={styles.h2}>Wszystko dla Twojego księgozbioru</h2>
        </div>
        <div className="feature-grid" style={styles.featureGrid}>
          {FEATURES.map((f) => (
            <div key={f.title} className="feature-card" style={styles.featureCard}>
              <div style={styles.featureIcon}><f.icon size={22} color={FOREST} /></div>
              <h3 style={styles.h3}>{f.title}</h3>
              <p style={styles.cardText}>{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* DLA KOGO */}
      <section id="dla-kogo" style={{ ...styles.section, background: CARD, borderTop: "1px solid #E6DFCB", borderBottom: "1px solid #E6DFCB", maxWidth: "none" }}>
        <div style={styles.sectionInner}>
          <div style={styles.sectionHead}>
            <span style={styles.eyebrow}>DLA KOGO JESTEŚMY</span>
            <h2 style={styles.h2}>Zbudowane dla ludzi, którzy kochają papier</h2>
          </div>
          <div className="feature-grid" style={styles.audienceGrid}>
            {AUDIENCE.map((a) => (
              <div key={a.title} style={styles.audienceCard}>
                <div style={styles.audienceEmoji}>{a.emoji}</div>
                <h3 style={styles.h3}>{a.title}</h3>
                <p style={styles.cardText}>{a.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MISJA */}
      <section id="misja" style={styles.section}>
        <div style={styles.missionWrap}>
          <Quote size={40} color={BRASS} style={{ opacity: 0.6 }} />
          <p style={styles.missionText}>
            Wierzymy, że przeczytana książka nie powinna kurzyć się na półce ani lądować
            w koszu. Budujemy miejsce, w którym łatwo ogarnąć własny księgozbiór,
            dzielić się opiniami i dać książkom drugie życie — wymieniając je bezpośrednio
            z ludźmi z okolicy, bez pośredników i prowizji.
          </p>
          <p style={styles.missionSign}>— zespół Księgozbioru</p>
        </div>
      </section>

      {/* CTA */}
      <section id="zaloz" style={styles.ctaBand}>
        <h2 style={styles.ctaTitle}>Zacznij od jednej książki z półki</h2>
        <p style={styles.ctaSub}>Załóż darmowe konto, dodaj pierwszy tytuł, a reszta biblioteki dopisze się sama.</p>
        <div style={styles.ctaBtns}>
          <Link href={isLoggedIn ? "/biblioteka" : "/login"} style={styles.btnPrimaryLg}>
            {isLoggedIn ? "Otwórz bibliotekę" : "Załóż darmowe konto"}
          </Link>
          {!isLoggedIn && <Link href="/login" style={styles.btnOutlineLg}>Mam już konto — zaloguj</Link>}
        </div>
      </section>

      {/* FOOTER */}
      <footer style={styles.footer}>
        <div style={styles.footerInner}>
          <div style={styles.logo}>
            <BookMarked size={20} color={FOREST} />
            <span style={{ ...styles.logoText, fontSize: 17 }}>Księgozbiór</span>
          </div>
          <div style={styles.footerLinks}>
            <a href="#funkcje" style={styles.footerLink}>Funkcje</a>
            <a href="#dla-kogo" style={styles.footerLink}>Dla kogo</a>
            <a href="#misja" style={styles.footerLink}>Misja</a>
          </div>
          <p style={styles.footerCopy}>© 2026 Księgozbiór</p>
        </div>
      </footer>
    </div>
  );
}

const css = `
.landing .feature-card { transition: transform .2s ease, box-shadow .2s ease; }
.landing .feature-card:hover { transform: translateY(-4px); box-shadow: 0 18px 40px -24px rgba(32,48,58,0.5); }
@media (max-width: 860px) {
  .landing .nav-links { display: none !important; }
  .landing .hero-grid { grid-template-columns: 1fr !important; }
  .landing .feature-grid { grid-template-columns: 1fr 1fr !important; }
  .landing .search-row { flex-direction: column !important; }
}
@media (max-width: 560px) {
  .landing .feature-grid { grid-template-columns: 1fr !important; }
}
`;

const styles: Record<string, CSSProperties> = {
  app: { fontFamily: "var(--font-body)", background: PAPER, color: INK, minHeight: "100vh" },

  nav: { position: "sticky", top: 0, zIndex: 30, background: "rgba(244,238,224,0.85)", backdropFilter: "blur(10px)", borderBottom: "1px solid #E6DFCB" },
  navInner: { maxWidth: 1200, margin: "0 auto", padding: "0 24px", height: 66, display: "flex", alignItems: "center", justifyContent: "space-between" },
  logo: { display: "flex", alignItems: "center", gap: 8 },
  logoText: { fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 600, color: INK },
  navLinks: { display: "flex", gap: 28 },
  navLink: { fontSize: 14, fontWeight: 500, color: MUTED },
  navCta: { display: "flex", alignItems: "center", gap: 14 },
  navGhost: { fontSize: 14, fontWeight: 600, color: INK },
  navBtn: { fontSize: 14, fontWeight: 600, color: "#fff", background: FOREST, padding: "9px 16px", borderRadius: 10 },

  hero: { position: "relative", overflow: "hidden", borderBottom: "1px solid #E6DFCB" },
  heroGlow: { position: "absolute", top: -120, right: -120, width: 480, height: 480, borderRadius: "50%", background: `radial-gradient(circle, ${BRASS}33, transparent 65%)`, pointerEvents: "none" },
  heroGrid: { maxWidth: 1200, margin: "0 auto", padding: "72px 24px", display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 56, alignItems: "center" },
  badge: { display: "inline-block", fontSize: 12, fontWeight: 600, letterSpacing: 1, color: FOREST, background: `${FOREST}14`, padding: "6px 14px", borderRadius: 999, marginBottom: 20 },
  h1: { fontFamily: "var(--font-display)", fontSize: 52, lineHeight: 1.05, fontWeight: 600, letterSpacing: "-0.5px" },
  lead: { fontSize: 18, lineHeight: 1.6, color: MUTED, marginTop: 20, maxWidth: 520 },
  heroCtas: { display: "flex", flexWrap: "wrap", gap: 12, marginTop: 30 },
  btnPrimary: { background: FOREST, color: "#fff", fontSize: 15, fontWeight: 600, padding: "14px 22px", borderRadius: 12, boxShadow: "0 8px 20px -8px rgba(47,93,80,0.6)" },
  btnOutline: { display: "inline-flex", alignItems: "center", gap: 7, background: "transparent", color: INK, fontSize: 15, fontWeight: 600, padding: "14px 22px", borderRadius: 12, border: "1px solid #D8CFB8" },

  searchCard: { marginTop: 36, background: CARD, border: "1px solid #E6DFCB", borderRadius: 16, padding: 18, maxWidth: 520, boxShadow: "0 18px 40px -28px rgba(32,48,58,0.5)" },
  searchLabel: { fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: BRASS, marginBottom: 12 },
  searchRow: { display: "flex", gap: 10 },
  searchInputWrap: { flex: 1, display: "flex", alignItems: "center", gap: 8, background: PAPER, border: "1px solid #E0D7C0", borderRadius: 10, padding: "11px 12px" },
  searchInput: { flex: 1, border: "none", background: "transparent", fontSize: 14, color: INK, outline: "none" },
  searchBtn: { background: INK, color: "#fff", border: "none", fontSize: 14, fontWeight: 600, padding: "0 22px", borderRadius: 10, cursor: "pointer" },
  searchHint: { fontSize: 12, color: MUTED, marginTop: 10 },

  heroVisual: { position: "relative" },
  shelfWrap: { display: "flex", flexDirection: "column", alignItems: "center" },
  shelfRow: { display: "flex", alignItems: "flex-end", gap: 5, height: 200 },
  plank: { height: 12, width: "100%", background: "linear-gradient(180deg, #8A6A46, #6E5236)", borderRadius: 3, marginTop: 2, boxShadow: "0 12px 24px -14px rgba(32,48,58,0.6)" },
  statCard: { marginTop: 26, background: CARD, border: "1px solid #E6DFCB", borderRadius: 16, padding: "18px 12px", display: "flex", alignItems: "center", justifyContent: "space-around", boxShadow: "0 18px 40px -28px rgba(32,48,58,0.5)" },
  statItem: { textAlign: "center" },
  statNum: { fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 600, color: INK },
  statLbl: { fontSize: 11, color: MUTED, marginTop: 3 },
  statDiv: { width: 1, height: 34, background: "#E0D7C0" },

  section: { maxWidth: 1200, margin: "0 auto", padding: "72px 24px" },
  sectionInner: { maxWidth: 1200, margin: "0 auto" },
  sectionHead: { textAlign: "center", maxWidth: 620, margin: "0 auto 44px" },
  eyebrow: { fontSize: 12, fontWeight: 700, letterSpacing: 2, color: BRASS },
  h2: { fontFamily: "var(--font-display)", fontSize: 34, fontWeight: 600, marginTop: 10, lineHeight: 1.15 },
  featureGrid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20 },
  featureCard: { background: CARD, border: "1px solid #E6DFCB", borderRadius: 16, padding: 24 },
  featureIcon: { width: 46, height: 46, borderRadius: 12, background: `${FOREST}14`, display: "grid", placeItems: "center", marginBottom: 16 },
  h3: { fontFamily: "var(--font-display)", fontSize: 19, fontWeight: 600 },
  cardText: { fontSize: 14, lineHeight: 1.55, color: MUTED, marginTop: 8 },

  audienceGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 },
  audienceCard: { background: PAPER, border: "1px solid #E6DFCB", borderRadius: 16, padding: 28, textAlign: "center" },
  audienceEmoji: { fontSize: 38, marginBottom: 10 },

  missionWrap: { maxWidth: 760, margin: "0 auto", textAlign: "center" },
  missionText: { fontFamily: "var(--font-display)", fontSize: 26, lineHeight: 1.5, fontWeight: 400, color: INK, marginTop: 16 },
  missionSign: { fontSize: 14, color: MUTED, marginTop: 20, fontStyle: "italic" },

  ctaBand: { background: INK, color: PAPER, textAlign: "center", padding: "72px 24px" },
  ctaTitle: { fontFamily: "var(--font-display)", fontSize: 36, fontWeight: 600 },
  ctaSub: { fontSize: 16, color: "#B9C2C0", marginTop: 12, maxWidth: 520, marginLeft: "auto", marginRight: "auto" },
  ctaBtns: { display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 12, marginTop: 28 },
  btnPrimaryLg: { background: BRASS, color: INK, fontSize: 16, fontWeight: 700, padding: "15px 26px", borderRadius: 12 },
  btnOutlineLg: { background: "transparent", color: PAPER, fontSize: 16, fontWeight: 600, padding: "15px 26px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.25)" },

  footer: { background: CARD, borderTop: "1px solid #E6DFCB" },
  footerInner: { maxWidth: 1200, margin: "0 auto", padding: "28px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 },
  footerLinks: { display: "flex", gap: 22, flexWrap: "wrap" },
  footerLink: { fontSize: 13, color: MUTED, fontWeight: 500 },
  footerCopy: { fontSize: 13, color: MUTED },
};
