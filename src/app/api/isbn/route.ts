import { NextResponse } from "next/server";
import { fetchBookByIsbn } from "@/lib/openlibrary";
import { fetchBookFromBN } from "@/lib/nationallibrary";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const isbn = searchParams.get("isbn") ?? "";

  // Oba źródła równolegle: BN daje polskie metadane, Open Library — okładkę.
  const [bn, ol] = await Promise.all([
    fetchBookFromBN(isbn),
    fetchBookByIsbn(isbn),
  ]);

  if (!bn && !ol) {
    return NextResponse.json({ found: false });
  }

  const book = {
    title: bn?.title || ol?.title || "",
    author: bn?.author || ol?.author || "",
    year: bn?.year ?? ol?.year ?? null,
    pages: bn?.pages ?? ol?.pages ?? null,
    publisher: bn?.publisher ?? ol?.publisher ?? null,
    coverUrl: ol?.coverUrl ?? null, // okładka tylko z Open Library
    isbn13: bn?.isbn13 ?? ol?.isbn13 ?? null,
    isbn10: bn?.isbn10 ?? ol?.isbn10 ?? null,
  };

  return NextResponse.json({ found: true, book, source: bn ? "bn" : "openlibrary" });
}
