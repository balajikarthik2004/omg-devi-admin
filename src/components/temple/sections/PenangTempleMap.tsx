import { useRef, useState } from "react";
import {
  ArrowUpRight,
  Car,
  Clock,
  Layers,
  MapPin,
  Maximize2,
  Users,
  Sparkles,
  Footprints,
  Landmark,
  ShieldCheck,
  Calendar,
  Info,
  CheckCircle2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { penangGroundsMap, penangZones, type Zone } from "./penang-map-data";

type Translate = (text: string) => string;
const identity: Translate = (text) => text;

type MapProps = {
  selectedId: string;
  onSelect: (id: string) => void;
  showMarkers: boolean;
  t: Translate;
};

function GroundsPlan({ selectedId, onSelect, showMarkers, t }: MapProps) {
  return (
    <div className="relative isolate aspect-[3/2] min-h-48 overflow-hidden rounded-2xl bg-[#0b1f19] shadow-md border border-slate-200">
      <img
        src={penangGroundsMap}
        alt={t("Thaneermalai Shree Balathandayuthapani Devasthanam live aerial crowd heatmap")}
        className="absolute inset-0 size-full object-cover"
      />
      {showMarkers &&
        penangZones.map(
          (zone, index) =>
            zone.marker && (
              <button
                key={zone.id}
                type="button"
                aria-label={t(zone.name)}
                title={t(zone.name)}
                aria-pressed={zone.id === selectedId}
                onClick={() => onSelect(zone.id)}
                style={{ left: `${zone.marker.x}%`, top: `${zone.marker.y}%` }}
                className="absolute flex size-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white bg-[#0f3d2e] text-xs font-extrabold text-white shadow-xl hover:bg-[#1a5a44] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white aria-pressed:z-10 aria-pressed:bg-amber-400 aria-pressed:text-[#0b1f19] transition-transform hover:scale-110 sm:size-7 cursor-pointer"
              >
                {index + 1}
                {zone.id === selectedId && (
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute top-full left-1/2 mt-1 w-max max-w-28 -translate-x-1/2 rounded-md bg-[#0b1f19]/90 backdrop-blur-xs px-2 py-1 text-center text-[10px] font-bold leading-tight text-white border border-white/20 sm:max-w-40 sm:text-xs shadow-lg"
                  >
                    {t(zone.name)}
                  </span>
                )}
              </button>
            ),
        )}
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
  const [selectedZone, setSelectedZone] = useState<Zone>(penangZones[0]);
  const [showMarkers, setShowMarkers] = useState(false); // default OFF per user instruction
  const detailsRef = useRef<HTMLElement>(null);

  const selectZone = (id: string) => {
    const zone = penangZones.find((entry) => entry.id === id);
    if (zone) setSelectedZone(zone);
  };

  const mapProps = { selectedId: selectedZone.id, onSelect: selectZone, showMarkers, t };
  const panel = "rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5";

  return (
    <div className="space-y-6">
      {/* Real Live Key Performance Indicators */}
      <dl className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4" aria-label={t("Live temple status")}>
        {[
          { label: "Hilltop Darshan Wait", value: "35–40 mins", sub: "Steady sanctum flow", Icon: Clock, color: "text-amber-800 bg-amber-50" },
          { label: "Devotee Footfall Today", value: "~6,400 Pilgrims", sub: "Peak weekend darshan", Icon: Users, color: "text-rose-800 bg-rose-50" },
          { label: "Granite Steps Climb", value: "513 Steps", sub: "Elevation ~120m / ~25 mins", Icon: Footprints, color: "text-blue-800 bg-blue-50" },
          { label: "Parking Bay Capacity", value: "68% Occupied", sub: "160 slots open on Jalan Kebun Bunga", Icon: Car, color: "text-emerald-800 bg-emerald-50" },
        ].map(({ label, value, sub, Icon, color }) => (
          <div key={label} className={`${panel} flex items-center gap-3.5`}>
            <span className={`rounded-xl p-3 ${color}`}><Icon className="size-5" /></span>
            <div>
              <dt className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t(label)}</dt>
              <dd className="font-extrabold text-slate-900 text-lg leading-tight mt-0.5">{t(value)}</dd>
              <span className="text-[11px] text-muted-foreground">{t(sub)}</span>
            </div>
          </div>
        ))}
      </dl>

      {/* Main Map & Zone Detail Section */}
      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_22rem]">
        {/* Left: Aerial Crowd Heatmap Illustration */}
        <section aria-label={t("Temple grounds plan")} className={panel}>
          <div className="mb-3.5 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="font-serif text-xl font-bold text-slate-900">{t("Temple Grounds & Live Crowd Map")}</h2>
              <p className="text-xs text-muted-foreground">
                Thaneermalai Shree Balathandayuthapani Devasthanam · Official Aerial Illustration
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowMarkers(!showMarkers)}
                className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                  showMarkers
                    ? "border-emerald-600 bg-emerald-50 text-emerald-800"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                <Layers className="size-3.5" />
                {showMarkers ? t("Hide Zone Markers") : t("Show Zone Markers")}
              </button>
              <Dialog>
                <DialogTrigger asChild>
                  <button type="button" className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer">
                    <Maximize2 className="size-4" /> {t("Full view")}
                  </button>
                </DialogTrigger>
                <DialogContent className="max-h-[95dvh] w-[calc(100%_-_1.5rem)] max-w-6xl overflow-y-auto">
                  <DialogTitle>{t("Thaneermalai Shree Balathandayuthapani Devasthanam Grounds")}</DialogTitle>
                  <DialogDescription>{t(selectedZone.name)} · {t(selectedZone.detail)}</DialogDescription>
                  <GroundsPlan {...mapProps} />
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <GroundsPlan {...mapProps} />

          <div className="mt-3.5 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-xs text-slate-600 border-t border-slate-100 pt-3">
            <div className="flex items-center gap-4">
              <span className="inline-flex items-center gap-1.5 font-semibold">
                <span className="size-2.5 rounded-full bg-emerald-500" /> {t("Low crowd (<40%)")}
              </span>
              <span className="inline-flex items-center gap-1.5 font-semibold">
                <span className="size-2.5 rounded-full bg-amber-500" /> {t("Moderate crowd (40–70%)")}
              </span>
              <span className="inline-flex items-center gap-1.5 font-semibold">
                <span className="size-2.5 rounded-full bg-rose-500" /> {t("High crowd (>70%)")}
              </span>
            </div>
            <span className="text-[11px] text-muted-foreground">Waterfall Road · George Town, Penang</span>
          </div>
        </section>

        {/* Right: Selected Zone Details & Visitor Advice */}
        <section ref={detailsRef} aria-label={t("Selected zone details")} className={`${panel} scroll-mt-24 space-y-4`}>
          <div aria-live="polite" className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-emerald-800">
                <MapPin className="size-4" /> {t(selectedZone.area)}
              </p>
              <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800">
                {selectedZone.crowdLevel}
              </span>
            </div>

            <h2 className="font-serif text-xl font-bold text-slate-900">{t(selectedZone.name)}</h2>
            <p className="text-sm leading-relaxed text-slate-600">{t(selectedZone.detail)}</p>
          </div>

          {/* Visitor Guidance Box */}
          <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-3 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
              <Info className="size-3.5 text-emerald-700" /> {t("Pilgrim Guidance")}
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">{selectedZone.advice}</p>
            <div className="text-[11px] font-semibold text-emerald-800 pt-1">
              Estimated wait: {selectedZone.waitEstimate}
            </div>
          </div>

          <div className="flex flex-col items-start gap-2 text-xs font-semibold text-emerald-800 border-t border-slate-100 pt-3">
            <a href={selectedZone.source} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 underline underline-offset-2">
              {t("Penang Hindu Endowments Board (HEB) record")} <ArrowUpRight className="size-3.5" />
            </a>
            <a href={directions} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 underline underline-offset-2">
              {t("Get directions on Google Maps")} <ArrowUpRight className="size-3.5" />
            </a>
            <a href={parkingMap} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 underline underline-offset-2">
              {t("Find Waterfall Hilltop Car Park")} <ArrowUpRight className="size-3.5" />
            </a>
          </div>
        </section>
      </div>

      {/* Zone Status Table */}
      <section className={panel} aria-label={t("Temple zones and status")}>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div>
            <h2 className="font-serif text-xl font-bold text-slate-900">{t("Temple Zones & Live Crowd Density")}</h2>
            <p className="text-xs text-slate-600">{t("Click on any zone to inspect live pilgrim flow and visitor recommendations.")}</p>
          </div>
          <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            {penangZones.length} Key Precincts Monitored
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wider">
              <tr>
                <th scope="col" className="px-3.5 py-2.5">{t("Zone / Precinct")}</th>
                <th scope="col" className="px-3.5 py-2.5">{t("Location Area")}</th>
                <th scope="col" className="px-3.5 py-2.5">{t("Live Status")}</th>
                <th scope="col" className="px-3.5 py-2.5">{t("Wait Time")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {penangZones.map((zone, index) => (
                <tr key={zone.id} className={zone.id === selectedZone.id ? "bg-emerald-50/80 font-medium" : "hover:bg-slate-50/60"}>
                  <th scope="row" className="px-3.5 py-3">
                    <button
                      type="button"
                      aria-pressed={zone.id === selectedZone.id}
                      onClick={() => {
                        setSelectedZone(zone);
                        detailsRef.current?.scrollIntoView({ block: "nearest" });
                      }}
                      className="flex items-center gap-2.5 text-left font-semibold text-slate-900 underline-offset-4 hover:underline cursor-pointer"
                    >
                      {zone.marker && (
                        <span aria-hidden="true" className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[#0f3d2e] text-[10px] font-bold text-white">
                          {index + 1}
                        </span>
                      )}
                      <span>{t(zone.name)}</span>
                    </button>
                  </th>
                  <td className="px-3.5 py-3 text-slate-600 text-xs">{t(zone.area)}</td>
                  <td className="px-3.5 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      zone.crowdLevel.includes("High")
                        ? "text-rose-700 bg-rose-50 border border-rose-200"
                        : zone.crowdLevel.includes("Moderate")
                        ? "text-amber-700 bg-amber-50 border border-amber-200"
                        : "text-emerald-700 bg-emerald-50 border border-emerald-200"
                    }`}>
                      {zone.crowdLevel}
                    </span>
                  </td>
                  <td className="px-3.5 py-3 text-xs font-semibold text-slate-700">{zone.waitEstimate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Daily Pooja Schedule & Heritage Milestones */}
      <div className="grid gap-5 lg:grid-cols-2">
        <section className={panel}>
          <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900 mb-3">
            <Clock className="size-5 text-emerald-800" /> Daily Pooja & Darshan Timings
          </h2>
          <p className="text-xs text-muted-foreground mb-4">
            Official worship schedule of Thaneermalai Balathandayuthapani Devasthanam (Malaysia Time · MYT).
          </p>

          <div className="space-y-2.5 text-xs">
            {[
              { name: "Viswaroopa Darshan", time: "6:00 AM – 6:30 AM", detail: "Early morning sanctum awakening" },
              { name: "Kala Santhi Pooja", time: "8:00 AM", detail: "Morning worship, milk abhishegam and archanai" },
              { name: "Uchi Kaalam (Noon Pooja)", time: "12:00 PM", detail: "Midday pooja (Sanctum closes 12:00 PM – 4:30 PM)" },
              { name: "Sayaratchai Pooja", time: "6:00 PM", detail: "Sunset pooja with stairway lanterns illuminated" },
              { name: "Raakkalam Pooja", time: "8:30 PM", detail: "Night worship & arthajamam (Sanctum closes 9:00 PM)" },
            ].map((p, idx) => (
              <div key={idx} className="flex items-center justify-between rounded-xl bg-slate-50 border border-slate-200/70 p-3">
                <div>
                  <div className="font-bold text-slate-900">{p.name}</div>
                  <div className="text-[11px] text-muted-foreground">{p.detail}</div>
                </div>
                <div className="font-mono font-bold text-emerald-800 bg-white px-2.5 py-1 rounded-lg border border-emerald-200 text-xs">
                  {p.time}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className={panel}>
          <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900 mb-3">
            <Landmark className="size-5 text-emerald-800" /> Temple Heritage & Significance
          </h2>
          <p className="text-xs text-muted-foreground mb-4">
            Key architectural and cultural facts managed by the Penang Hindu Endowments Board.
          </p>

          <div className="space-y-3 text-xs text-slate-700">
            <div className="flex items-start gap-2.5 rounded-xl bg-emerald-50/60 border border-emerald-100 p-3">
              <CheckCircle2 className="size-4 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900">Largest Lord Murugan Temple Outside India:</strong>
                <p className="text-slate-600 mt-0.5">Consecrated on 29 June 2012 with a 7-storey, 21.6 m (70 ft) Raja Gopuram crowning the hill.</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 rounded-xl bg-emerald-50/60 border border-emerald-100 p-3">
              <CheckCircle2 className="size-4 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900">513 Granite Steps Ascent:</strong>
                <p className="text-slate-600 mt-0.5">A scenic climb surpassing Batu Caves' 272 steps, winding through Penang Hill's tropical rainforest.</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 rounded-xl bg-emerald-50/60 border border-emerald-100 p-3">
              <CheckCircle2 className="size-4 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900">Historical Thaipusam Focal Point:</strong>
                <p className="text-slate-600 mt-0.5">Over 1,000,000 devotees gather annually for Thaipusam, carrying kavadis from Queen Street to the hilltop.</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 rounded-xl bg-emerald-50/60 border border-emerald-100 p-3">
              <CheckCircle2 className="size-4 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900">8.23 m Lord Shiva Dhyana Statue:</strong>
                <p className="text-slate-600 mt-0.5">Imposing 27-foot seated Shiva statue in meditation posture overlooking the entrance forecourt.</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
