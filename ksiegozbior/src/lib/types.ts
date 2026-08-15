// Typy odpowiadające schematowi bazy (MVP).
// Docelowo można je generować automatycznie: `supabase gen types typescript`.

export type ReadingStatus = "want_to_read" | "reading" | "read" | "abandoned";
export type PhysicalState = "in_library" | "lent_out" | "on_exchange" | "lost";

export interface BookCatalog {
  id: string;
  isbn_10: string | null;
  isbn_13: string | null;
  title: string;
  author: string;
  publisher: string | null;
  publication_year: number | null;
  cover_image_url: string | null;
  cover_color: string | null;
  description: string | null;
  page_count: number | null;
  category: string | null;
}

export interface LibraryItem {
  id: string;
  user_id: string;
  book_id: string;
  reading_status: ReadingStatus;
  physical_state: PhysicalState;
  current_page: number | null;
  purchase_price: number | null;
  purchase_location: string | null;
  purchase_date: string | null;
  user_rating: number | null;
  private_notes: string | null;
  read_date: string | null;
  tags: string[];
  is_shelf_public: boolean;
  added_at: string;
  // dołączona pozycja katalogu (join):
  book: BookCatalog;
}
