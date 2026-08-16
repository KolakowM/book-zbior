"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { CSSProperties } from "react";
import {
  BookMarked, Library, Store, ArrowLeftRight, Trophy, Sparkles,
  User, Settings, LogOut,
} from "lucide-react";
import { signOut } from "@/lib/actions/auth";

const BONE = "#ECE7DA";
const INK = "#17251F";
const GREEN = "#153A2C";
const RUST = "#B0472A";
const MUTED = "#5A5B50";

const NAV = [
  { href: "/biblioteka", label: "Biblioteka", icon: Library },
  { href: "/gielda", label: "Giełda", icon: Store },
  { href: "/wymiany", label: "Wymiany", icon: ArrowLeftRight },
  { href: "/wyzwania", label: "Wyzwania", icon: Trophy },
  { href: "/inspiracje", label: "Inspiracje", icon: Sparkles },
];

const MOBILE = [
  { href: "/biblioteka", label: "Półka", icon: Library },
  { href: "/gielda", label: "Giełda", icon: Store },
  { href: "/wyzwania", label: "Wyzwania", icon: Trophy },
  { href: "/inspiracje", label: "Inspiracje", icon: Sparkles },
  { href: "/profil", label: "Profil", icon: User },
];

export default function AppNav() {
  const pathname = usePathname();
  const active = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <>
      <style>{css}</style>

      <header className="appnav-top" style={styles.top}>
        <div style={styles.topInner}>
          <Link href="/" style={styles.logo}>
            <BookMarked size={22} color={GREEN} />
            <span style={styles.logoText}>Księgozbiór</span>
          </Link>

          <nav className="appnav-links" style={styles.links}>
            {NAV.map((n) => (
              <Link key={n.href} href={n.href}
                style={{ ...styles.link, ...(active(n.href) ? styles.linkActive : {}) }}>
                <n.icon size={16} />
                {n.label}
              </Link>
            ))}
          </nav>

          <div style={styles.right}>
            <Link href="/ustawienia" style={styles.iconBtn} aria-label="Ustawienia"><Settings size={18} /></Link>
            <Link href="/profil" style={styles.avatar} aria-label="Profil"><User size={18} /></Link>
            <form action={signOut}>
              <button type="submit" style={styles.logout} aria-label="Wyloguj"><LogOut size={18} /></button>
            </form>
          </div>
        </div>
      </header>

      <nav className="appnav-bottom" style={styles.bottom}>
        {MOBILE.map((n) => (
          <Link key={n.href} href={n.href}
            style={{ ...styles.tab, ...(active(n.href) ? styles.tabActive : {}) }}>
            <n.icon size={20} />
            <span style={styles.tabLabel}>{n.label}</span>
          </Link>
        ))}
      </nav>
    </>
  );
}

const css = `
.appnav-bottom { display: none; }
@media (max-width: 820px) {
  .appnav-links { display: none !important; }
  .appnav-bottom { display: flex !important; }
}
`;

const styles: Record<string, CSSProperties> = {
  top: { position: "sticky", top: 0, zIndex: 40, background: "rgba(236,231,218,0.92)", backdropFilter: "blur(10px)", borderBottom: "1px solid #DAD4C2" },
  topInner: { maxWidth: 1200, margin: "0 auto", padding: "0 20px", height: 62, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 },
  logo: { display: "flex", alignItems: "center", gap: 8, flexShrink: 0 },
  logoText: { fontFamily: "var(--font-display)", fontSize: 19, fontWeight: 600, color: INK },
  links: { display: "flex", gap: 4 },
  link: { display: "flex", alignItems: "center", gap: 7, fontSize: 14, fontWeight: 500, color: MUTED, padding: "8px 14px", borderRadius: 8 },
  linkActive: { color: INK, background: "#E1DAC8", fontWeight: 600 },
  right: { display: "flex", alignItems: "center", gap: 8, flexShrink: 0 },
  iconBtn: { width: 38, height: 38, borderRadius: 8, display: "grid", placeItems: "center", color: MUTED },
  avatar: { width: 38, height: 38, borderRadius: "50%", background: GREEN, color: "#fff", display: "grid", placeItems: "center" },
  logout: { width: 38, height: 38, borderRadius: 8, display: "grid", placeItems: "center", color: MUTED, background: "none", border: "none", cursor: "pointer" },

  bottom: { position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 40, background: BONE, borderTop: "1px solid #DAD4C2", justifyContent: "space-around", padding: "8px 0 12px" },
  tab: { display: "flex", flexDirection: "column", alignItems: "center", gap: 3, fontSize: 10, fontWeight: 500, color: "#9A9585", flex: 1 },
  tabActive: { color: INK },
  tabLabel: {},
};
