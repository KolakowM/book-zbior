import { ArrowLeftRight } from "lucide-react";
import SectionPlaceholder from "@/components/SectionPlaceholder";

export default function WymianyPage() {
  return (
    <SectionPlaceholder
      title="Wymiany i wiadomości"
      description="Prowadź rozmowy o wymianie i śledź status każdej transakcji w jednym miejscu."
      icon={ArrowLeftRight}
      planned={[
        "Lista rozmów z podziałem na statusy: oczekujące, w toku, zakończone",
        "Czat tekstowy bez podawania numeru telefonu",
        "Podgląd proponowanej wymiany: książka A za książkę B",
        "Akceptacja, odrzucenie i oznaczenie jako zrealizowane",
        "Wystawienie oceny drugiej stronie po wymianie",
      ]}
    />
  );
}
