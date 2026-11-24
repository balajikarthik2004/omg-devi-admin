import { useRef, useState } from "react";
import { ArrowUpRight, Car, Clock, MapPin, Maximize2, Users } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { penangGroundsMap, penangZones } from "./penang-map-data";

type Translate = (text: string) => string;
const identity: Translate = (text) => text;

type MapProps = {
  selectedId: string;
  onSelect: (id: string) => void;
  t: Translate;
};

function GroundsPlan({ selectedId, onSelect, t }: MapProps) {
  return (
    <div className="relative isolate aspect-[160/81] min-h-48 overflow-hidden rounded-2xl bg-[#112c27]">
      <img src={penangGroundsMap} alt={t("North-up plan of the mapped temple buildings and uphill footpath")} className="absolute inset-0 size-full" />
      <div aria-label={t("North points up")} className="absolute right-3 bottom-3 flex size-9 flex-col items-center justify-center rounded-full border border-white/30 bg-[#112c27] text-xs font-bold leading-none text-white">
        <span aria-hidden="true">↑</span><span>N</span>
      </div>
      {penangZones.map((zone, index) => zone.marker && (
        <button
          key={zone.id}
          type="button"
          aria-label={t(zone.name)}
          title={t(zone.name)}
          aria-pressed={zone.id === selectedId}
          onClick={() => onSelect(zone.id)}
          style={{ left: `${zone.marker.x}%`, top: `${zone.marker.y}%` }}
          className="absolute flex size-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white bg-[#214b3f] text-xs font-extrabold text-white shadow-lg hover:bg-[#306253] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white aria-pressed:z-10 aria-pressed:bg-amber-300 aria-pressed:text-[#112c27] sm:size-8"
        >
          {index + 1}
          {zone.id === selectedId && (
            <span aria-hidden="true" className="pointer-events-none absolute top-full left-1/2 mt-1 w-max max-w-28 -translate-x-1/2 rounded-md bg-[#112c27] px-2 py-1 text-center text-[10px] leading-tight text-white sm:max-w-40 sm:text-xs">
              {t(zone.name)}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

export function PenangTempleMap({
  directions,
  parkingMap,
  translate = identity,
}: {
  directions: string;
  parkingMap: string;
  translate?: Translate;
}) {
  const t = translate;
  const [selectedZone, setSelectedZone] = useState(penangZones[0]);
  const detailsRef = useRef<HTMLElement>(null);
  const selectZone = (id: string) => {
    const zone = penangZones.find((entry) => entry.id === id);
    if (zone) setSelectedZone(zone);
  };
  const mapProps = { selectedId: selectedZone.id, onSelect: selectZone, t };
  const panel = "rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5";

  return (
    <div className="space-y-5">
      <dl className="grid gap-3 sm:grid-cols-3" aria-label={t("Live temple status")}>
        {[
          { label: "Darshan wait", Icon: Clock },
          { label: "Crowd level", Icon: Users },
          { label: "Parking occupancy", Icon: Car },
        ].map(({ label, Icon }) => (
          <div key={label} className={`${panel} flex items-center gap-3`}>
            <span className="rounded-xl bg-emerald-50 p-2.5 text-emerald-800"><Icon className="size-5" /></span>
            <div>
              <dt className="text-sm text-slate-600">{t(label)}</dt>
              <dd className="font-bold text-slate-900">{t("Unavailable")}</dd>
            </div>
          </div>
        ))}
      </dl>

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_19rem]">
        <section aria-label={t("Temple grounds plan")} className={panel}>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-serif text-xl font-bold text-slate-900">{t("Temple grounds plan")}</h2>
            <Dialog>
              <DialogTrigger asChild>
                <button type="button" className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                  <Maximize2 className="size-4" /> {t("Full view")}
                </button>
              </DialogTrigger>
              <DialogContent className="max-h-[95dvh] w-[calc(100%_-_1.5rem)] max-w-6xl overflow-y-auto">
                <DialogTitle>{t("Waterfall Hilltop Temple grounds")}</DialogTitle>
                <DialogDescription>{t(selectedZone.name)} · {t(selectedZone.detail)}</DialogDescription>
                <GroundsPlan {...mapProps} />
              </DialogContent>
            </Dialog>
          </div>
          <GroundsPlan {...mapProps} />
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-600">
            <span className="inline-flex items-center gap-1.5"><span className="h-1 w-5 rounded-full bg-[#c47e2f]" /> {t("Uphill pedestrian route")}</span>
            <span className="inline-flex items-center gap-1.5"><span className="size-3 rounded-sm border border-[#8e6c38] bg-[#e9c88a]" /> {t("Shrine footprint")}</span>
            <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer" className="underline underline-offset-2">© OpenStreetMap contributors</a>
          </div>
        </section>

        <section ref={detailsRef} aria-label={t("Selected zone details")} className={`${panel} scroll-mt-24 space-y-4`}>
          <div aria-live="polite" className="space-y-2">
            <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-emerald-800"><MapPin className="size-4" /> {t(selectedZone.area)}</p>
            <h2 className="font-serif text-xl font-bold text-slate-900">{t(selectedZone.name)}</h2>
            <p className="text-sm leading-relaxed text-slate-600">{t(selectedZone.detail)}</p>
          </div>
          <div className="flex flex-col items-start gap-2 text-sm font-semibold text-emerald-800">
            <a href={selectedZone.source} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 underline underline-offset-2">{t("View zone source")} <ArrowUpRight className="size-4" /></a>
            <a href={directions} target="_blank" rel="noreferrer" className="underline underline-offset-2">{t("Get directions")}</a>
            <a href={parkingMap} target="_blank" rel="noreferrer" className="underline underline-offset-2">{t("Find the temple car park")}</a>
          </div>
        </section>
      </div>

      <section className={panel} aria-label={t("Temple zones and status")}>
        <h2 className="mb-1 font-serif text-xl font-bold text-slate-900">{t("Temple zones")}</h2>
        <p className="mb-3 text-sm text-slate-600">{t("Select a zone for its location and visitor information. Live monitoring is unavailable for this temple.")}</p>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th scope="col" className="px-3 py-2">{t("Zone")}</th>
                <th scope="col" className="px-3 py-2">{t("Area")}</th>
                <th scope="col" className="px-3 py-2">{t("Live status")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {penangZones.map((zone, index) => (
                <tr key={zone.id} className={zone.id === selectedZone.id ? "bg-emerald-50" : ""}>
                  <th scope="row" className="px-3 py-2">
                    <button type="button" aria-pressed={zone.id === selectedZone.id} onClick={() => {
                      setSelectedZone(zone);
                      detailsRef.current?.scrollIntoView({ block: "nearest" });
                    }} className="flex items-center gap-2 text-left font-semibold text-slate-900 underline-offset-4 hover:underline">
                      {zone.marker && <span aria-hidden="true" className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[#214b3f] text-[10px] font-bold text-white">{index + 1}</span>}
                      {t(zone.name)}
                    </button>
                  </th>
                  <td className="px-3 py-2 text-slate-600">{t(zone.area)}</td>
                  <td className="px-3 py-2 text-slate-600">{t("Unavailable")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
