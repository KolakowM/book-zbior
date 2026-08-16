import Link from "next/link";
import type { CSSProperties } from "react";
import { BookMarked, Barcode, Star, Repeat, BarChart3, ArrowRight, Search } from "lucide-react";

const GREEN = "#153A2C";
const GREEN2 = "#1E4A38";
const BONE = "#ECE7DA";
const BONE2 = "#F3EFE4";
const INK = "#17251F";
const RUST = "#B0472A";
const OCHRE = "#C0871B";
const BONEDIM = "#9FB3A6";

const FEATURES = [
  { icon: Barcode, h: "Kataloguj po ISBN", t: "Wpisujesz numer, resztę dopisujemy z bazy Biblioteki Narodowej: tytuł, autora, rok, liczbę stron. Polskie wydania też." },
  { icon: Star, h: "Oceniaj i recenzuj", t: "Gwiazdki, notatki, recenzje. Przy każdym tytule widać, co o nim sądzą inni czytelnicy." },
  { icon: Repeat, h: "Wymieniaj z sąsiadem", t: "Oznaczasz książkę jako dostępną. Umawiacie się bezpośrednio — bez prowizji, bez wysyłki na siłę." },
  { icon: BarChart3, h: "Zobacz swój rok", t: "Ile przeczytałeś i za ile, jacy autorzy, jakie gatunki. Twój rok czytelniczy w liczbach." },
];

const AUDIENCE = [
  { h: "Zbieraczom", t: "Setki tomów, które w końcu chcesz mieć spisane — z ceną, datą i miejscem zakupu." },
  { h: "Czytającym dużo", t: "Śledzisz postępy, oceny i to, dokąd zmierza Twój rok czytelniczy." },
  { h: "Wymieniającym się", t: "Wolisz oddać książkę sąsiadowi, niż patrzeć, jak kurzy się na półce." },
];

const SPINES = ["#B0472A", "#C0871B", "#2E6B4F", "#7A4A2A", "#3D4A6B", "#8A3050", "#4A5D3A"];
const SPINE_T = ["Solaris", "Lód", "Bieguni", "Cyberiada", "Diuna", "Ferdydurke", "Sklepy"];

function Spine({ c, t, h }: { c: string; t: string; h: number }) {
  return (
    <div style={{ width: 30, height: h, background: c, borderRadius: "2px 2px 0 0", display: "flex",
      alignItems: "center", justifyContent: "center", boxShadow: "inset -4px 0 7px rgba(0,0,0,0.3), inset 3px 0 3px rgba(255,255,255,0.12)" }}>
      <span style={{ writingMode: "vertical-rl", transform: "rotate(180deg)", fontSize: 10, color: "rgba(255,255,255,0.9)",
        fontWeight: 600, letterSpacing: 0.3, whiteSpace: "nowrap", overflow: "hidden", maxHeight: h - 18, textOverflow: "ellipsis" }}>{t}</span>
    </div>
  );
}

export default function Landing({ isLoggedIn }: { isLoggedIn: boolean }) {
  const primaryHref = isLoggedIn ? "/biblioteka" : "/login";
  return (
    <div style={S.app}>
      <style>{css}</style>

      <header style={S.nav}>
        <div style={S.navInner}>
          <Link href="/" style={S.brand}><BookMarked size={22} color={GREEN} /><span style={S.brandText}>Księgozbiór</span></Link>
          <nav className="navlinks" style={S.navLinks}>
            <a href="#co" style={S.navLink}>Co potrafi</a>
            <a href="#kogo" style={S.navLink}>Dla kogo</a>
            <a href="#idea" style={S.navLink}>Nasza idea</a>
          </nav>
          <div style={S.navRight}>
            {isLoggedIn ? (
              <Link href="/biblioteka" style={S.navBtn}>Moja biblioteka</Link>
            ) : (
              <>
                <Link href="/login" style={S.navGhost}>Zaloguj</Link>
                <Link href="/login" style={S.navBtn}>Załóż konto</Link>
              </>
            )}
          </div>
        </div>
      </header>

      <section style={S.hero}>
        <div className="herogrid" style={S.heroGrid}>
          <div>
            <h1 style={S.h1}>Zapanuj nad półką.<br />Podziel się nią z okolicą.</h1>
            <p style={S.lead}>
              Skanujesz ISBN — my dopisujemy okładkę, autora i rok. Oceniasz, recenzujesz
              i wystawiasz do wymiany książki, które masz już za sobą. Cała biblioteka w jednym miejscu,
              i drugie życie dla tego, co przeczytane.
            </p>
            <div style={S.ctaRow}>
              <Link href={primaryHref} style={S.btnRust}>{isLoggedIn ? "Otwórz moją bibliotekę" : "Załóż darmowy księgozbiór"}</Link>
              <a href="#co" style={S.btnLine}>Zobacz, jak działa <ArrowRight size={16} /></a>
            </div>

            <div style={S.searchCard}>
              <div style={S.searchRow}>
                <div style={S.searchField}>
                  <Search size={16} color={BONEDIM} />
                  <input style={S.searchInput} placeholder="Sprawdź tytuł albo ISBN…" />
                </div>
                <button style={S.searchBtn}>Szukaj</button>
              </div>
              <p style={S.searchHint}>Bez rejestracji. Dane z Biblioteki Narodowej i Open Library.</p>
            </div>
          </div>

          <div style={S.heroArt}>
            <div style={S.shelfRow}>
              {SPINES.map((c, i) => <Spine key={i} c={c} t={SPINE_T[i]} h={168 + ((i * 41) % 46)} />)}
            </div>
            <div style={S.plank} />
            <div style={S.statStrip}>
              <div><div style={S.statN}>18 / 25</div><div style={S.statL}>rok czytelniczy</div></div>
              <div style={S.statSep} />
              <div><div style={S.statN}>4 820</div><div style={S.statL}>stron w tym roku</div></div>
              <div style={S.statSep} />
              <div><div style={S.statN}>12</div><div style={S.statL}>wymian</div></div>
            </div>
          </div>
        </div>
      </section>

      <section id="co" style={S.section}>
        <div className="cogrid" style={S.coGrid}>
          <div style={S.coIntro}>
            <h2 style={S.h2}>Wszystko, czego potrzebuje Twój księgozbiór</h2>
            <p style={S.coIntroText}>
              Od zeskanowania pierwszego grzbietu po podsumowanie całego roku. Bez arkuszy,
              bez przepisywania z okładki.
            </p>
          </div>
          <div style={S.featureList}>
            {FEATURES.map((f) => (
              <div key={f.h} style={S.featureRow}>
                <div style={S.featureIcon}><f.icon size={20} color={RUST} /></div>
                <div>
                  <h3 style={S.h3}>{f.h}</h3>
                  <p style={S.featureText}>{f.t}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="kogo" style={S.bandBone}>
        <div style={S.sectionInner}>
          <h2 style={{ ...S.h2, marginBottom: 40 }}>Dla ludzi, którzy trzymają się papieru</h2>
          <div className="kogogrid" style={S.audGrid}>
            {AUDIENCE.map((a) => (
              <div key={a.h}>
                <div style={S.audRule} />
                <h3 style={S.audH}>{a.h}</h3>
                <p style={S.audT}>{a.t}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="idea" style={S.idea}>
        <div style={S.ideaInner}>
          <p style={S.ideaQuote}>
            Przeczytana książka nie powinna kończyć w pudle w piwnicy. Powinna trafić do kogoś,
            kto jej jeszcze nie zna — najlepiej z sąsiedztwa.
          </p>
          <p style={S.ideaSign}>To dla nas cały pomysł na Księgozbiór.</p>
        </div>
      </section>

      <section id="start" style={S.start}>
        <h2 style={S.startH}>Zacznij od jednej książki z półki</h2>
        <p style={S.startT}>Załóż darmowe konto i zeskanuj pierwszy grzbiet. Reszta biblioteki dopisze się sama.</p>
        <div style={S.ctaRow2}>
          <Link href={primaryHref} style={S.btnRust}>{isLoggedIn ? "Otwórz bibliotekę" : "Załóż darmowe konto"}</Link>
          {!isLoggedIn && <Link href="/login" style={S.btnLineDark}>Mam już konto</Link>}
        </div>
      </section>

      <footer style={S.footer}>
        <div style={S.footerInner}>
          <span style={{ ...S.brandText, color: BONE }}>Księgozbiór</span>
          <div style={S.footerLinks}>
            <a href="#co" style={S.footerLink}>Co potrafi</a>
            <a href="#kogo" style={S.footerLink}>Dla kogo</a>
            <a href="#idea" style={S.footerLink}>Idea</a>
          </div>
          <span style={S.footerCopy}>© 2026</span>
        </div>
      </footer>
    </div>
  );
}

const css = `
.navlinks { display: flex; }
@media (max-width: 880px) {
  .navlinks { display: none !important; }
  .herogrid, .cogrid, .kogogrid { grid-template-columns: 1fr !important; }
}
`;

const S: Record<string, CSSProperties> = {
  app: { fontFamily: "var(--font-body)", background: BONE, color: INK },

  nav: { position: "sticky", top: 0, zIndex: 30, background: "rgba(236,231,218,0.92)", backdropFilter: "blur(10px)", borderBottom: "1px solid #DAD4C2" },
  navInner: { maxWidth: 1160, margin: "0 auto", padding: "0 24px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" },
  brand: { display: "flex", alignItems: "center", gap: 9 },
  brandText: { fontFamily: "var(--font-display)", fontSize: 21, fontWeight: 600, color: INK },
  navLinks: { gap: 30 },
  navLink: { fontSize: 14.5, fontWeight: 500, color: "#4A5750" },
  navRight: { display: "flex", alignItems: "center", gap: 18 },
  navGhost: { fontSize: 14.5, fontWeight: 600, color: INK },
  navBtn: { fontSize: 14.5, fontWeight: 600, color: BONE, background: RUST, padding: "9px 17px", borderRadius: 8 },

  hero: { background: GREEN, color: BONE },
  heroGrid: { maxWidth: 1160, margin: "0 auto", padding: "84px 24px 90px", display: "grid", gridTemplateColumns: "1.05fr 0.95fr", gap: 60, alignItems: "center" },
  h1: { fontFamily: "var(--font-display)", fontSize: 58, lineHeight: 1.04, fontWeight: 600, letterSpacing: "-0.5px", color: "#F4EFE2" },
  lead: { fontSize: 18, lineHeight: 1.65, color: "#CFD8CE", marginTop: 22, maxWidth: "60ch" },
  ctaRow: { display: "flex", flexWrap: "wrap", gap: 14, marginTop: 32 },
  btnRust: { background: RUST, color: "#fff", fontSize: 15.5, fontWeight: 600, padding: "14px 24px", borderRadius: 9 },
  btnLine: { display: "inline-flex", alignItems: "center", gap: 8, color: "#F4EFE2", fontSize: 15.5, fontWeight: 600, padding: "14px 22px", borderRadius: 9, border: "1px solid rgba(244,239,226,0.3)" },

  searchCard: { marginTop: 38, maxWidth: 480 },
  searchRow: { display: "flex", gap: 10 },
  searchField: { flex: 1, display: "flex", alignItems: "center", gap: 8, background: GREEN2, border: "1px solid #2C5A45", borderRadius: 9, padding: "12px 13px" },
  searchInput: { flex: 1, border: "none", background: "transparent", fontSize: 14.5, color: BONE, outline: "none" },
  searchBtn: { background: OCHRE, color: "#231A05", border: "none", fontSize: 14.5, fontWeight: 700, padding: "0 22px", borderRadius: 9, cursor: "pointer" },
  searchHint: { fontSize: 12.5, color: "#9FB3A6", marginTop: 10 },

  heroArt: { display: "flex", flexDirection: "column", alignItems: "center" },
  shelfRow: { display: "flex", alignItems: "flex-end", gap: 6, height: 216 },
  plank: { width: "100%", maxWidth: 360, height: 13, background: "linear-gradient(180deg,#5A4326,#3E2E19)", borderRadius: 2, marginTop: 2 },
  statStrip: { marginTop: 30, display: "flex", alignItems: "center", gap: 22 },
  statN: { fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 600, color: "#F4EFE2" },
  statL: { fontSize: 12, color: "#9FB3A6", marginTop: 2 },
  statSep: { width: 1, height: 32, background: "#2C5A45" },

  section: { maxWidth: 1160, margin: "0 auto", padding: "84px 24px" },
  sectionInner: { maxWidth: 1160, margin: "0 auto" },
  coGrid: { display: "grid", gridTemplateColumns: "0.85fr 1.15fr", gap: 56 },
  coIntro: { position: "sticky", top: 90, alignSelf: "start" },
  h2: { fontFamily: "var(--font-display)", fontSize: 38, fontWeight: 600, lineHeight: 1.12, color: INK },
  coIntroText: { fontSize: 17, lineHeight: 1.6, color: "#5A5B50", marginTop: 16, maxWidth: "34ch" },
  featureList: { display: "flex", flexDirection: "column", gap: 4 },
  featureRow: { display: "flex", gap: 18, padding: "22px 0", borderTop: "1px solid #DAD4C2" },
  featureIcon: { width: 42, height: 42, borderRadius: 9, background: "#E1DAC8", display: "grid", placeItems: "center", flexShrink: 0 },
  h3: { fontFamily: "var(--font-display)", fontSize: 21, fontWeight: 600, color: INK },
  featureText: { fontSize: 15.5, lineHeight: 1.6, color: "#5A5B50", marginTop: 6, maxWidth: "56ch" },

  bandBone: { background: BONE2, borderTop: "1px solid #DAD4C2", borderBottom: "1px solid #DAD4C2", padding: "84px 24px" },
  audGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 40 },
  audRule: { width: 44, height: 3, background: RUST, marginBottom: 18 },
  audH: { fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 600, color: INK },
  audT: { fontSize: 16, lineHeight: 1.6, color: "#5A5B50", marginTop: 10 },

  idea: { background: GREEN, color: BONE, padding: "96px 24px" },
  ideaInner: { maxWidth: 820, margin: "0 auto", textAlign: "center" },
  ideaQuote: { fontFamily: "var(--font-display)", fontSize: 32, lineHeight: 1.42, fontWeight: 500, color: "#F4EFE2" },
  ideaSign: { fontSize: 15, color: OCHRE, marginTop: 22, fontWeight: 600 },

  start: { maxWidth: 1160, margin: "0 auto", padding: "90px 24px", textAlign: "center" },
  startH: { fontFamily: "var(--font-display)", fontSize: 40, fontWeight: 600, color: INK },
  startT: { fontSize: 17, color: "#5A5B50", marginTop: 14, maxWidth: "50ch", marginLeft: "auto", marginRight: "auto", lineHeight: 1.6 },
  ctaRow2: { display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 14, marginTop: 30 },
  btnLineDark: { color: INK, fontSize: 15.5, fontWeight: 600, padding: "14px 24px", borderRadius: 9, border: "1px solid #C7C0AC" },

  footer: { background: GREEN, color: BONE },
  footerInner: { maxWidth: 1160, margin: "0 auto", padding: "26px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 14 },
  footerLinks: { display: "flex", gap: 22 },
  footerLink: { fontSize: 13.5, color: "#9FB3A6" },
  footerCopy: { fontSize: 13.5, color: "#9FB3A6" },
};
