import { User } from "lucide-react";
import SectionPlaceholder from "@/components/SectionPlaceholder";

export default function ProfilPage() {
  return (
    <SectionPlaceholder
      title="Mój profil"
      description="Publiczna wizytówka czytelnika: półka, recenzje i oceny wymian."
      icon={User}
      planned={[
        "Awatar, nazwa, miasto i ocena na giełdzie",
        "Półka publiczna: przeczytane, chcę przeczytać, na wymianę",
        "Lista napisanych recenzji z ocenami",
        "Aktywne oferty na giełdzie",
        "Opinie od innych po zrealizowanych wymianach",
      ]}
    />
  );
}
