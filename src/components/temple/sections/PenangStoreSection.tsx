import { ArrowUpRight, Phone, Store } from "lucide-react";
import { penangTemple } from "@/lib/penang-temple";
import { penangOfferings, penangPrayerSource } from "@/lib/penang-visit";

export function PenangStoreSection() {
  return (
    <div className="space-y-5">
      <header className="temple-page-heading">
        <span className="temple-page-icon" aria-hidden="true"><Store size={21} /></span>
        <div>
          <h1 className="text-2xl font-extrabold sm:text-3xl">Temple Store</h1>
          <p className="mt-1 text-sm text-muted-foreground">{penangTemple.name}</p>
        </div>
      </header>
      <section className="rounded-2xl border bg-white p-5 sm:p-6" aria-labelledby="penang-store-catalog">
        <h2 id="penang-store-catalog" className="text-lg font-bold">Services shown to devotees</h2>
        <ul className="mt-4 divide-y divide-slate-100">
          {penangOfferings.map((offering) => (
            <li key={offering.name} className="flex flex-wrap items-start justify-between gap-2 py-4">
              <div>
                <h3 className="text-sm font-bold">{offering.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{offering.description}</p>
              </div>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">Temple enquiry</span>
            </li>
          ))}
        </ul>
        <a href={penangPrayerSource} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm font-semibold text-primary underline underline-offset-2">Temple Board prayer timetable <ArrowUpRight className="size-4" /></a>
      </section>
      <section className="space-y-3 rounded-2xl border bg-white p-5 sm:p-6">
        <h2 className="text-lg font-bold">Store operations</h2>
        <p className="text-sm text-muted-foreground">A retail catalog, pricing, inventory, and online orders are currently unavailable.</p>
        <a href={penangTemple.phoneHref} className="inline-flex items-center gap-2 text-sm font-semibold text-primary underline underline-offset-2"><Phone className="size-4" /> {penangTemple.phone}</a>
      </section>
    </div>
  );
}
