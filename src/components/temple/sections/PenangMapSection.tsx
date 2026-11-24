import { MapPin } from "lucide-react";
import { penangTemple } from "@/lib/penang-temple";
import { PenangTempleMap } from "./PenangTempleMap";

export function PenangMapSection() {
  return (
    <div className="space-y-5">
      <header className="temple-page-heading">
        <span className="temple-page-icon" aria-hidden="true"><MapPin size={21} /></span>
        <div>
          <h1 className="text-2xl font-extrabold sm:text-3xl">Temple Map</h1>
          <p className="mt-1 text-sm text-muted-foreground">{penangTemple.name}</p>
        </div>
      </header>
      <PenangTempleMap directions={penangTemple.directions} parkingMap={penangTemple.parkingMap} />
    </div>
  );
}
