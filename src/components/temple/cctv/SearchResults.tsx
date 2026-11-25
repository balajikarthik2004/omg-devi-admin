import { useState } from "react";
import { ArrowRight, Bell, Download, LocateFixed, Video, ScanFace, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { CameraScan, SearchAudit, Sighting } from "@/lib/cctv-service";
import { AiDetectionModal } from "./AiDetectionModal";
import {
  absoluteTime,
  clockTime,
  download,
  field,
  muted,
  panel,
  relativeTime,
} from "./presentation";

export function ScanProgress({ ids, scans }: { ids: string[]; scans: CameraScan[] }) {
  const next = ids.find((id) => !scans.some((scan) => scan.cameraId === id));
  return (
    <section className={panel + " space-y-4 p-4 sm:p-5"}>
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-base font-extrabold">Scanning cameras</h3>
        <span className="text-xs font-bold tabular-nums text-secondary">
          {Math.round((scans.length / ids.length) * 100)}%
        </span>
      </div>
      <progress
        aria-label="Scan progress"
        value={scans.length}
        max={ids.length}
        className="cctv-progress"
      />
      <p role="status" className={muted}>
        {scans.length} of {ids.length} cameras scanned ·{" "}
        {scans.reduce((total, scan) => total + scan.matches.length, 0)} sightings found
      </p>
      <ul className="grid gap-1.5 min-[1080px]:grid-cols-2">
        {ids.map((id) => {
          const scan = scans.find((item) => item.cameraId === id);
          return (
            <li
              key={id}
              className="flex items-center justify-between gap-2 rounded-md bg-muted/55 p-2 text-xs"
            >
              <strong>{id}</strong>
              <span className={scan ? (scan.matches.length > 0 ? "text-emerald-800 font-bold" : "text-muted-foreground") : "text-muted-foreground"}>
                {scan
                  ? "✓ " + scan.matches.length + (scan.matches.length === 1 ? " match" : " matches")
                  : id === next
                    ? "Scanning…"
                    : "Queued"}
              </span>
            </li>
          );
        })}
      </ul>
      {scans.some((scan) => scan.matches.length) && (
        <ul aria-label="Incoming sightings" className="flex flex-wrap gap-2">
          {scans
            .flatMap((scan) => scan.matches)
            .map((match) => (
              <li
                key={match.id}
                className="rounded-md bg-secondary-tint px-2 py-1 text-xs text-secondary font-semibold border border-secondary/20"
              >
                {match.cameraName} · {match.confidence}%
              </li>
            ))}
        </ul>
      )}
    </section>
  );
}

export function SightingTimeline({
  matches,
  onSelectSighting,
}: {
  matches: Sighting[];
  onSelectSighting?: (match: Sighting) => void;
}) {
  return (
    <section className={panel + " p-4"}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-extrabold">Movement trail</h3>
        <span className="text-[11px] text-muted-foreground">Chronological journey (oldest → newest)</span>
      </div>
      <ol
        className="mt-3 flex gap-2 overflow-x-auto pb-2"
        aria-label="Sightings in chronological order"
      >
        {[...matches].reverse().map((match, index) => (
          <li key={match.id} className="flex shrink-0 items-center gap-2">
            {index > 0 && <ArrowRight size={13} className="text-muted-foreground" />}
            <button
              type="button"
              onClick={() => onSelectSighting?.(match)}
              className="flex items-center gap-2 rounded-lg border border-border bg-secondary-tint/45 px-3 py-2 text-left hover:border-emerald-500/50 hover:bg-secondary-tint/80 transition-all cursor-pointer"
            >
              <img src={match.thumbnail} alt="" className="size-8 rounded object-cover border border-secondary/20" />
              <div>
                <time
                  title={absoluteTime(match.timestamp)}
                  className="text-[10px] font-bold tabular-nums text-secondary"
                >
                  {clockTime(match.timestamp)}
                </time>
                <div className="text-xs font-semibold">{match.cameraName}</div>
                <div className="text-[9px] text-muted-foreground">{match.zone}</div>
              </div>
            </button>
          </li>
        ))}
      </ol>
    </section>
  );
}

function exportSightings(matches: Sighting[]) {
  const rows = [
    ["Camera ID", "Camera", "Zone", "Timestamp", "Confidence (%)"],
    ...matches.map((match) => [
      match.cameraId,
      match.cameraName,
      match.zone,
      new Date(match.timestamp).toISOString(),
      String(match.confidence),
    ]),
  ];
  const csv = rows
    .map((row) => row.map((value) => '"' + value.replaceAll('"', '""') + '"').join(","))
    .join("\r\n");
  download(new Blob(["\ufeff", csv], { type: "text/csv;charset=utf-8" }), "cctv-sightings.csv");
}

export function SearchResults({
  matches,
  now,
  onView,
  onReset,
}: {
  matches: Sighting[];
  now: number;
  onView: (id: string) => void;
  onReset: () => void;
}) {
  const [selectedSighting, setSelectedSighting] = useState<Sighting | null>(null);
  const [sort, setSort] = useState("recent");
  const recent = [...matches].sort((a, b) => b.timestamp - a.timestamp);
  const last = recent[0];
  const ordered =
    sort === "confidence"
      ? [...recent].sort((a, b) => b.confidence - a.confidence)
      : sort === "camera"
        ? [...recent].sort((a, b) => a.cameraName.localeCompare(b.cameraName))
        : recent;
  const cameraCount = new Set(matches.map((match) => match.cameraId)).size;
  return (
    <div className="space-y-4">
      <section className={panel + " space-y-3 p-4 sm:p-5"}>
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h3 className="text-base font-extrabold">Scan results</h3>
            <p className={muted} role="status">
              {matches.length} {matches.length === 1 ? "sighting" : "sightings"} across{" "}
              {cameraCount} {cameraCount === 1 ? "camera" : "cameras"}
              {last &&
                ", last seen " +
                  relativeTime(last.timestamp, now).toLowerCase() +
                  " at " +
                  last.cameraName}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={!matches.length}
              onClick={() => exportSightings(ordered)}
            >
              <Download /> Export CSV
            </Button>
            <Button type="button" size="sm" onClick={onReset}>
              New Search
            </Button>
          </div>
        </div>
        {last ? (
          <div className="rounded-xl border border-secondary/20 bg-secondary-tint/70 p-4 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs font-bold text-secondary">
                <LocateFixed size={15} /> Last Known Sighting
              </div>
              <span className="flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-500/30">
                <CheckCircle2 size={11} /> Match Verified {last.confidence}%
              </span>
            </div>
            <div className="mt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="text-base font-extrabold text-foreground">{last.cameraName}</div>
                <p className={muted}>
                  {last.cameraId} · {last.zone} · Spotted {relativeTime(last.timestamp, now)}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  onClick={() => setSelectedSighting(last)}
                  className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-extrabold shadow-sm"
                >
                  <ScanFace size={14} className="mr-1.5" /> Inspect AI Detection
                </Button>
                <Button type="button" size="sm" variant="outline" onClick={() => onView(last.cameraId)}>
                  <Video size={14} className="mr-1.5" /> View Live
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => toast.success("Notified volunteers in " + last.cameraName + " zone")}
                >
                  <Bell size={14} className="mr-1.5" /> Alert Staff
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <p className="rounded-lg bg-muted/70 p-3 text-sm text-muted-foreground">
            No sightings met the selected scope and confidence threshold.
          </p>
        )}
      </section>
      {last && (
        <>
          <SightingTimeline matches={recent} onSelectSighting={setSelectedSighting} />
          <section aria-label="Matching sightings" className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-extrabold">Sightings Detected</h3>
                <p className="text-[11px] text-muted-foreground">
                  Select any detection below to freeze keyframe and inspect AI bounding box & biometric matches
                </p>
              </div>
              <select
                aria-label="Sort sightings"
                className={field + " text-xs"}
                value={sort}
                onChange={(event) => setSort(event.target.value)}
              >
                <option value="recent">Most recent</option>
                <option value="confidence">Confidence</option>
                <option value="camera">Camera</option>
              </select>
            </div>
            <div className="grid gap-2.5 min-[1080px]:grid-cols-2 min-[1650px]:grid-cols-3">
              {ordered.map((match) => (
                <button
                  key={match.id}
                  type="button"
                  onClick={() => setSelectedSighting(match)}
                  className={
                    panel +
                    " group relative flex min-w-0 items-center gap-3 p-2.5 text-left transition-all hover:border-emerald-500/60 hover:shadow-md cursor-pointer"
                  }
                >
                  <div className="relative size-14 shrink-0 overflow-hidden rounded-lg border border-border">
                    <img
                      src={match.thumbnail}
                      alt=""
                      className="size-full object-cover transition-transform group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-emerald-500/10 opacity-0 transition-opacity group-hover:opacity-100" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-xs font-bold text-foreground group-hover:text-emerald-700" title={match.cameraName}>
                      {match.cameraName}
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      {match.cameraId} · {match.zone}
                    </div>
                    <div className="mt-0.5 flex items-center gap-1.5 text-[10px] text-muted-foreground">
                      <time
                        title={absoluteTime(match.timestamp)}
                        className="font-mono tabular-nums text-foreground/80"
                      >
                        {clockTime(match.timestamp)}
                      </time>
                      <span>·</span>
                      <span className="text-emerald-700 font-semibold">Freeze & view AI box</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <strong className="rounded-md bg-emerald-100 px-1.5 py-0.5 text-xs tabular-nums text-emerald-800 border border-emerald-200">
                      {match.confidence}%
                    </strong>
                    <span className="text-[10px] text-secondary font-bold group-hover:underline">Inspect →</span>
                  </div>
                </button>
              ))}
            </div>
          </section>
        </>
      )}

      {/* Forensic AI Person Detection Freeze-Frame Modal */}
      <AiDetectionModal
        sighting={selectedSighting}
        allMatches={ordered}
        now={now}
        onClose={() => setSelectedSighting(null)}
        onSelectSighting={setSelectedSighting}
        onGoToLiveCamera={onView}
      />
    </div>
  );
}

export function SearchAuditDrawer({
  open,
  onOpenChange,
  entries,
  loading,
  error,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entries: SearchAudit[];
  loading: boolean;
  error: boolean;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="cctv flex w-full flex-col gap-0 sm:max-w-lg">
        <SheetHeader className="pr-8">
          <SheetTitle>Search history</SheetTitle>
          <SheetDescription>Audit log for person searches.</SheetDescription>
        </SheetHeader>
        <div className="min-h-0 space-y-2 overflow-y-auto pt-4">
          {error ? (
            <p role="alert" className={muted}>
              Could not load search history.
            </p>
          ) : loading ? (
            <p className={muted}>Loading search history…</p>
          ) : entries.length ? (
            entries.map((entry) => (
              <article key={entry.id} className={panel + " space-y-1 p-3 text-xs"}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <strong>{entry.reason}</strong>
                  <time className={muted}>{absoluteTime(entry.timestamp)}</time>
                </div>
                <p>
                  {entry.user} · {entry.mode === "photo" ? "Photo" : "Description"}
                  {entry.caseRef && " · " + entry.caseRef}
                </p>
                <p className={muted} title={entry.scope.cameraIds.join(", ")}>
                  {entry.scope.cameraIds.length} cameras · {entry.scope.confidence}% confidence
                </p>
                <p className="break-words text-[10px] text-muted-foreground">
                  {absoluteTime(entry.scope.from)} – {absoluteTime(entry.scope.to)}
                </p>
              </article>
            ))
          ) : (
            <p className={muted}>No searches logged yet.</p>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
