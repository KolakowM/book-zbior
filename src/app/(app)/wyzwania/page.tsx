import { Trophy } from "lucide-react";
import SectionPlaceholder from "@/components/SectionPlaceholder";

export default function WyzwaniaPage() {
  return (
    <SectionPlaceholder
      eyebrow="TWOJA PASJA W LICZBACH"
      title="Wyzwania i statystyki"
      description="Podsumowanie roku czytelniczego: postępy, wydatki i ulubieni autorzy."
      icon={Trophy}
      planned={[
        "Wyzwanie roczne z wykresem pierścieniowym (np. 18/25)",
        "Wykres wydatków na książki miesiąc po miesiącu",
        "Ulubione gatunki i najczęściej czytani autorzy",
        "Łączna liczba przeczytanych stron i średnia ocena",
        "Eksport podsumowania roku (PDF / grafika do social media)",
      ]}
    />
  );
}
