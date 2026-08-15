import { Store } from "lucide-react";
import SectionPlaceholder from "@/components/SectionPlaceholder";

export default function GieldaPage() {
  return (
    <SectionPlaceholder
      eyebrow="WYMIANA"
      title="Giełda książek"
      description="Przeglądaj egzemplarze wystawione do wymiany przez czytelników w Twojej okolicy."
      icon={Store}
      planned={[
        "Lista ofert z filtrem po mieście i promieniu w km",
        "Wyszukiwanie po tytule, autorze i ISBN",
        "Stan egzemplarza i zdjęcia rzeczywiste",
        "Oznaczenie, na co właściciel chętnie się wymieni",
        "Bezpośredni kontakt — spotkanie na żywo, bez pośrednictwa",
      ]}
    />
  );
}
