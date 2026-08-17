// Pobieranie metadanych książki z API Biblioteki Narodowej (data.bn.org.pl).
// Najlepsze źródło dla polskich tytułów. Okładek BN nie udostępnia —
// te dobieramy osobno z Open Library.

import { cleanIsbn } from "./openlibrary";

export interface BookMeta {
  title: string;
  author: string;
  year: number | null;
  pages: number | null;
  publisher: string | null;
  coverUrl: string | null;
  isbn10: string | null;
  isbn13: string | null;
}

// Pomocnicze do czytania rekordu MARC (tam dane są czystsze niż w polach zbiorczych).
function marcField(fields: any[], tag: string): any | null {
  const f = fields.find((x) => x && x[tag] !== undefined);
  return f ? f[tag] : null;
}
function marcSub(field: any, code: string): string | null {
  if (!field || !Array.isArray(field.subfields)) return null;
  const sf = field.subfields.find((s: any) => s && s[code] !== undefined);
  return sf ? String(sf[code]) : null;
}
// Usuwa końcową interpunkcję katalogową: " :", " /", " ;", " ,"
function tidy(s: string): string {
  return s.replace(/\s*[/:;,]\s*$/, "").trim();
}
// "Lieber, Ron" -> "Ron Lieber"
function reformatAuthor(a: string): string {
  const m = a.match(/^([^,]+),\s*(.+)$/);
  return m ? `${m[2].trim()} ${m[1].trim()}` : a.trim();
}

export async function fetchBookFromBN(rawIsbn: string): Promise<BookMeta | null> {
  const isbn = cleanIsbn(rawIsbn);
  if (isbn.length !== 10 && isbn.length !== 13) return null;

  try {
    const res = await fetch(
      `https://data.bn.org.pl/api/networks/bibs.json?boolean=true&isbnIssn=${isbn}`,
      { headers: { Accept: "application/json" } }
    );
    if (!res.ok) return null;

    const data: any = await res.json();
    const bib = data?.bibs?.[0];
    if (!bib) return null;

    const fields: any[] = bib.marc?.fields ?? [];

    // Tytuł: MARC 245 a (+ b jako podtytuł)
    const f245 = marcField(fields, "245");
    let title = tidy(marcSub(f245, "a") ?? bib.title ?? "");
    const subtitle = marcSub(f245, "b");
    if (subtitle) title = `${title}: ${tidy(subtitle)}`;
    if (!title) return null;

    // Autor główny: MARC 100 a
    let author = marcSub(marcField(fields, "100"), "a") ?? "";
    if (author) author = reformatAuthor(author);

    // Liczba stron: MARC 300 a, np. "267 s. ;"
    const pagesStr = marcSub(marcField(fields, "300"), "a") ?? "";
    const pm = pagesStr.match(/(\d+)\s*s\b/);
    const pages = pm ? parseInt(pm[1], 10) : null;

    // Rok
    const ym = String(bib.publicationYear ?? "").match(/\d{4}/);
    const year = ym ? parseInt(ym[0], 10) : null;

    // Wydawca: MARC 260 b (czystszy niż pole zbiorcze)
    let publisher = marcSub(marcField(fields, "260"), "b") ?? bib.publisher ?? null;
    if (publisher) publisher = publisher.replace(/[,:;]\s*$/, "").trim();

    return {
      title,
      author,
      year,
      pages,
      publisher,
      coverUrl: null,
      isbn10: isbn.length === 10 ? isbn : null,
      isbn13: isbn.length === 13 ? isbn : null,
    };
  } catch {
    return null;
  }
}

// ─── Wyszukiwanie po tytule (podpowiedzi przy dodawaniu) ───────────
export interface SearchResult {
  title: string;
  author: string;
  year: number | null;
  pages: number | null;
  isbn13: string | null;
  isbn10: string | null;
}

function allMarcFields(fields: any[], tag: string): any[] {
  return fields.filter((x) => x && x[tag] !== undefined).map((x) => x[tag]);
}

export async function searchBooksByTitle(query: string): Promise<SearchResult[]> {
  const q = query.trim();
  if (q.length < 3) return [];

  try {
    const res = await fetch(
      `https://data.bn.org.pl/api/networks/bibs.json?title=${encodeURIComponent(q)}&limit=30`,
      { headers: { Accept: "application/json" } }
    );
    if (!res.ok) return [];

    const data: any = await res.json();
    const bibs: any[] = data?.bibs ?? [];
    const out: SearchResult[] = [];
    const seen = new Set<string>();

    for (const bib of bibs) {
      const fields: any[] = bib.marc?.fields ?? [];

      const f245 = marcField(fields, "245");
      let title = tidy(marcSub(f245, "a") ?? bib.title ?? "");
      const subtitle = marcSub(f245, "b");
      if (subtitle) title = `${title}: ${tidy(subtitle)}`;
      if (!title) continue;

      let author = marcSub(marcField(fields, "100"), "a") ?? "";
      if (author) author = reformatAuthor(author);

      const ym = String(bib.publicationYear ?? "").match(/\d{4}/);
      const year = ym ? parseInt(ym[0], 10) : null;

      const pagesStr = marcSub(marcField(fields, "300"), "a") ?? "";
      const pm = pagesStr.match(/(\d+)\s*s\b/);
      const pages = pm ? parseInt(pm[1], 10) : null;

      let isbn13: string | null = null;
      let isbn10: string | null = null;
      for (const f of allMarcFields(fields, "020")) {
        const raw = marcSub(f, "a");
        if (!raw) continue;
        const c = raw.replace(/[^0-9Xx]/g, "");
        if (c.length === 13 && !isbn13) isbn13 = c;
        else if (c.length === 10 && !isbn10) isbn10 = c;
      }

      const key = (title + "|" + author).toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);

      out.push({ title, author, year, pages, isbn13, isbn10 });
      if (out.length >= 8) break;
    }
    return out;
  } catch {
    return [];
  }
}
