import { ArrowUpRight, Clock, Flame, Landmark, MapPin, Phone, Store, Footprints, ShieldCheck } from "lucide-react";
import { penangTemple as temple } from "@/lib/penang-temple";

export function PenangTempleSection() {
  return (
    <div className="space-y-6">
      <figure className="overflow-hidden rounded-2xl border bg-white shadow-sm">
        <div className="relative isolate flex min-h-72 items-end overflow-hidden bg-emerald-950 text-white sm:min-h-80">
          <img src={temple.image} alt="Thaneermalai Shree Balathandayuthapani Devasthanam" className="absolute inset-0 h-full w-full object-cover object-[center_8%]" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />
          <div className="relative p-5 sm:p-8">
            <span className="inline-block rounded-full bg-amber-400/20 px-3 py-1 text-xs font-extrabold text-amber-300 border border-amber-400/30 mb-2">
              Largest Murugan Temple Outside India · Consecrated 2012
            </span>
            <h1 className="max-w-3xl font-serif text-3xl font-bold sm:text-4xl text-white">{temple.name}</h1>
            <p className="mt-1 text-sm text-emerald-200">{temple.alias}</p>
            <p className="mt-2 flex items-center gap-1.5 text-sm text-white/90">
              <MapPin className="size-4 text-emerald-400" /> {temple.city}, {temple.district}, {temple.state}
            </p>
          </div>
        </div>
      </figure>

      <nav aria-label="Penang temple services" className="flex flex-wrap gap-3">
        <a href="#map" className="inline-flex items-center gap-2 rounded-xl border bg-white px-4 py-2.5 text-sm font-semibold text-primary hover:bg-muted shadow-xs"><MapPin className="size-4" /> Temple Map & Grounds</a>
        <a href="#store" className="inline-flex items-center gap-2 rounded-xl border bg-white px-4 py-2.5 text-sm font-semibold text-primary hover:bg-muted shadow-xs"><Store className="size-4" /> Temple Store</a>
        <a href={temple.officialSite} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-900 hover:bg-emerald-100 shadow-xs">
          <ShieldCheck className="size-4" /> Penang Hindu Endowments Board <ArrowUpRight className="size-4" />
        </a>
      </nav>

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="space-y-4 rounded-2xl border bg-white p-5 sm:p-6 shadow-sm">
          <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
            <Landmark className="size-5 text-primary" /> Temple Profile & Architecture
          </h2>
          <div>
            <p className="text-sm font-semibold text-slate-900">{temple.deity}</p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              The original Thanneermalai Murugan shrine was founded circa 1800 near the waterfall, with the historic mid-hill shrine built in 1850. The modern hilltop sanctuary was consecrated in 2012. It features an imposing 7-storey, 21.6-metre Raja Gopuram and is reached by climbing 513 stone stairs.
            </p>
          </div>
          <div className="flex items-start gap-2 text-sm">
            <Footprints className="mt-0.5 size-4 shrink-0 text-primary" />
            <div>
              <p className="font-semibold text-slate-900">Ascent & Footfall</p>
              <p className="mt-0.5 text-xs text-muted-foreground">513 granite steps with resting pavilions every 100 steps. Free footwear storage at base.</p>
            </div>
          </div>
          <div className="flex items-start gap-2 text-sm">
            <Flame className="mt-0.5 size-4 shrink-0 text-primary" />
            <div>
              <p className="font-semibold text-slate-900">Annual Festivals</p>
              <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{temple.festivals}</p>
            </div>
          </div>
        </section>

        <section className="space-y-4 rounded-2xl border bg-white p-5 sm:p-6 shadow-sm">
          <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
            <Clock className="size-5 text-primary" /> Visiting Hours & Contact
          </h2>
          <div className="text-sm">
            <p className="font-semibold text-slate-900">{temple.hours}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">Open daily (MYT). Reopens at 4:30 PM for Sayaratchai. Free entry for all devotees.</p>
          </div>
          <p className="flex items-start gap-2 text-sm leading-relaxed text-muted-foreground">
            <MapPin className="mt-0.5 size-4 shrink-0 text-primary" /> {temple.address}
          </p>
          <div className="flex flex-wrap gap-4 text-xs font-semibold">
            <a href={temple.phoneHref} className="flex items-center gap-1.5 text-primary hover:underline">
              <Phone className="size-4" /> {temple.phone}
            </a>
            <a href={temple.directions} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-primary hover:underline">
              <MapPin className="size-4" /> Google Maps Directions <ArrowUpRight className="size-3.5" />
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
