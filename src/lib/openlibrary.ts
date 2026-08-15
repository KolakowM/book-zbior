// Pobieranie metadanych książki z Open Library po numerze ISBN.
// Używane po stronie serwera (w /api/isbn), więc bez problemów z CORS.

export interface OpenLibraryBook {
  title: string;
  author: string;
  year: number | null;
  pages: number | null;
  publisher: string | null;
  coverUrl: string | null;
  isbn10: string | null;
  isbn13: string | null;
}

export function cleanIsbn(raw: string): string {
  return raw.replace(/[^0-9Xx]/g, "").toUpperCase();
}

export async function fetchBookByIsbn(rawIsbn: string): Promise<OpenLibraryBook | null> {
  const isbn = cleanIsbn(rawIsbn);
  if (isbn.length !== 10 && isbn.length !== 13) return null;

  try {
    const res = await fetch(`https://openlibrary.org/isbn/${isbn}.json`, {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return null;
    const data: any = await res.json();

    // Autor bywa zwracany jako odnośnik — dociągamy nazwisko osobnym zapytaniem.
    let author = "";
    const authorKey = data.authors?.[0]?.key;
    if (authorKey) {
      try {
        const aRes = await fetch(`https://openlibrary.org${authorKey}.json`, {
          headers: { Accept: "application/json" },
        });
        if (aRes.ok) {
          const aData: any = await aRes.json();
          author = aData.name ?? "";
        }
      } catch {
        // brak autora — zostanie do uzupełnienia ręcznego
      }
    }

    const yearMatch = String(data.publish_date ?? "").match(/\d{4}/);
    const coverId = Array.isArray(data.covers)
      ? data.covers.find((c: number) => typeof c === "number" && c > 0)
      : null;

    return {
      title: data.title ?? "",
      author,
      year: yearMatch ? parseInt(yearMatch[0], 10) : null,
      pages: typeof data.number_of_pages === "number" ? data.number_of_pages : null,
      publisher: Array.isArray(data.publishers) ? data.publishers[0] ?? null : null,
      coverUrl: coverId ? `https://covers.openlibrary.org/b/id/${coverId}-L.jpg` : null,
      isbn10: data.isbn_10?.[0] ?? (isbn.length === 10 ? isbn : null),
      isbn13: data.isbn_13?.[0] ?? (isbn.length === 13 ? isbn : null),
    };
  } catch {
    return null;
  }
}
