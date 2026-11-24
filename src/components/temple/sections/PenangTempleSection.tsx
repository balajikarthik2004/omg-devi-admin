import { ArrowUpRight, Clock, Flame, Landmark, MapPin, Phone, Store } from "lucide-react";
import { penangTemple as temple } from "@/lib/penang-temple";

export function PenangTempleSection() {
  return (
    <div className="space-y-5">
      <figure className="overflow-hidden rounded-2xl border bg-white">
        <div className="relative isolate flex min-h-72 items-end overflow-hidden bg-emerald-950 text-white sm:min-h-80">
          <img src={temple.image} alt="AI-generated illustration of Waterfall Hilltop Temple" className="absolute inset-0 h-full w-full object-cover object-[center_8%]" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
          <div className="relative p-5 sm:p-8">
            <p className="mb-2 text-sm font-medium text-emerald-100">{temple.alias}</p>
            <h1 className="max-w-3xl font-serif text-3xl font-bold sm:text-4xl">{temple.name}</h1>
            <p className="mt-2 flex items-center gap-1.5 text-sm text-white/90">
              <MapPin className="size-4" /> {temple.city}, {temple.district}, {temple.state}
            </p>
          </div>
        </div>
        <figcaption className="px-4 py-2 text-right text-xs text-muted-foreground">AI-generated illustration</figcaption>
      </figure>

      <nav aria-label="Penang temple services" className="flex flex-wrap gap-3">
        <a href="#map" className="inline-flex items-center gap-2 rounded-xl border bg-white px-4 py-2.5 text-sm font-semibold text-primary hover:bg-muted"><MapPin className="size-4" /> Temple Map</a>
        <a href="#store" className="inline-flex items-center gap-2 rounded-xl border bg-white px-4 py-2.5 text-sm font-semibold text-primary hover:bg-muted"><Store className="size-4" /> Temple Store</a>
      </nav>

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="space-y-4 rounded-2xl border bg-white p-5 sm:p-6">
          <h2 className="flex items-center gap-2 text-lg font-bold">
            <Landmark className="size-5 text-primary" /> Temple profile
          </h2>
          <div>
            <p className="text-sm font-semibold">{temple.deity}</p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              The old Murugan shrine dates to 1850. The present hilltop complex features a 21.6-metre, seven-storey gopuram and is reached by more than 500 steps.
            </p>
          </div>
          <div className="flex items-start gap-2 text-sm">
            <Flame className="mt-0.5 size-4 shrink-0 text-primary" />
            <div>
              <p className="font-semibold">Annual festivals</p>
              <p className="mt-1 leading-relaxed text-muted-foreground">{temple.festivals}</p>
            </div>
          </div>
          <a href={temple.officialSite} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm font-semibold text-primary underline-offset-2 hover:underline">
            Penang Hindu Endowments Board <ArrowUpRight className="size-4" />
          </a>
        </section>

        <section className="space-y-4 rounded-2xl border bg-white p-5 sm:p-6">
          <h2 className="flex items-center gap-2 text-lg font-bold">
            <Clock className="size-5 text-primary" /> Visiting hours and contact
          </h2>
          <div className="text-sm">
            <p className="font-semibold">{temple.hours}</p>
            <p className="mt-1 text-muted-foreground">Daily, Malaysia time (MYT). Festival hours may vary.</p>
          </div>
          <p className="flex items-start gap-2 text-sm leading-relaxed text-muted-foreground">
            <MapPin className="mt-0.5 size-4 shrink-0 text-primary" /> {temple.address}
          </p>
          <a href={temple.phoneHref} className="flex items-center gap-2 text-sm font-semibold text-primary underline-offset-2 hover:underline">
            <Phone className="size-4" /> {temple.phone}
          </a>
          <a href={temple.tourismGuide} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm font-semibold text-primary underline-offset-2 hover:underline">
            Penang Global Tourism visitor guide <ArrowUpRight className="size-4" />
          </a>
        </section>
      </div>
      <p className="rounded-xl border bg-white px-5 py-4 text-sm text-muted-foreground">
        Live temple operations data is unavailable for this location.
      </p>
    </div>
  );
}
