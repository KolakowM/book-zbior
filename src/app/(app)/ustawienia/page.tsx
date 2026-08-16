import { Settings } from "lucide-react";
import SectionPlaceholder from "@/components/SectionPlaceholder";

export default function UstawieniaPage() {
  return (
    <SectionPlaceholder
      title="Ustawienia i prywatność"
      description="Zdecyduj, co jest widoczne publicznie, i skonfiguruj powiadomienia."
      icon={Settings}
      planned={[
        "Zmiana awatara, biogramu i domyślnej lokalizacji",
        "Prywatność: pokaż/ukryj ceny zakupu w profilu (domyślnie ukryte)",
        "Dokładność lokalizacji na mapie giełdy: dokładna vs tylko miasto",
        "Powiadomienia e-mail i push o ofertach oraz prośbach o wymianę",
        "Zarządzanie kontem i wylogowanie ze wszystkich urządzeń",
      ]}
    />
  );
}
