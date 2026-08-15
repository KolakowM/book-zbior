import { Sparkles } from "lucide-react";
import SectionPlaceholder from "@/components/SectionPlaceholder";

export default function InspiracjePage() {
  return (
    <SectionPlaceholder
      eyebrow="ODKRYWAJ"
      title="Strefa inspiracji"
      description="Znajdź kolejną książkę dla siebie — z oceną czytelników, którzy już ją przeczytali."
      icon={Sparkles}
      planned={[
        "Propozycje na podstawie Twojej biblioteki i wysoko ocenionych tytułów",
        "Średnia ocen społeczności przy każdej pozycji",
        "Odkrywanie po gatunkach i podobnych czytelnikach",
        "Linki do zakupu poza platformą (bez pośrednictwa)",
        "Dodanie tytułu wprost do listy „chcę przeczytać”",
      ]}
    />
  );
}
