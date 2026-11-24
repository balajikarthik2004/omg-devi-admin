import { useState } from "react";
import { ArrowRight, Bell, Download, LocateFixed, Video } from "lucide-react";
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
              <span className={scan ? "text-emerald-800" : "text-muted-foreground"}>
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
                className="rounded-md bg-secondary-tint px-2 py-1 text-xs text-secondary"
              >
                {match.cameraName} · {match.confidence}%
              </li>
            ))}
        </ul>
      )}
    </section>
  );
}

export function SightingTimeline({ matches }: { matches: Sighting[] }) {
  return (
    <section className={panel + " p-4"}>
      <h3 className="text-sm font-extrabold">Movement trail</h3>
      <ol
        className="mt-3 flex gap-2 overflow-x-auto pb-2"
        aria-label="Sightings in chronological order"
      >
        {[...matches].reverse().map((match, index) => (
          <li key={match.id} className="flex shrink-0 items-center gap-2">
            {index > 0 && <ArrowRight size={13} className="text-muted-foreground" />}
            <div className="rounded-lg border border-border bg-secondary-tint/45 px-3 py-2">
              <time
                title={absoluteTime(match.timestamp)}
                className="text-[10px] font-bold tabular-nums text-secondary"
              >
                {clockTime(match.timestamp)}
              </time>
              <div className="text-xs font-semibold">{match.zone}</div>
            </div>
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
          <div className="rounded-lg border border-secondary/15 bg-secondary-tint/65 p-3">
            <div className="flex items-center gap-2 text-xs font-bold text-secondary">
              <LocateFixed size={15} /> Last known location
            </div>
            <div className="mt-1 text-sm font-extrabold">{last.cameraName}</div>
            <p className={muted}>
              {last.zone} · {relativeTime(last.timestamp, now)}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button type="button" size="sm" onClick={() => onView(last.cameraId)}>
                <Video /> View live camera
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => toast.success("Notified volunteers in " + last.cameraName + " zone")}
              >
                <Bell /> Alert volunteers
              </Button>
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
          <SightingTimeline matches={recent} />
          <section aria-label="Matching sightings" className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-extrabold">Sightings</h3>
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
            <div className="grid gap-2 min-[1080px]:grid-cols-2 min-[1650px]:grid-cols-3">
              {ordered.map((match) => (
                <button
                  key={match.id}
                  type="button"
                  onClick={() => onView(match.cameraId)}
                  className={
                    panel +
                    " flex min-w-0 items-center gap-2 p-2 text-left hover:border-secondary/40"
                  }
                >
                  <img
                    src={match.thumbnail}
                    alt=""
                    className="size-14 shrink-0 rounded-md object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-xs font-bold" title={match.cameraName}>
                      {match.cameraName}
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      {match.cameraId} · {match.zone}
                    </div>
                    <time
                      title={absoluteTime(match.timestamp)}
                      className="text-[10px] tabular-nums text-muted-foreground"
                    >
                      {clockTime(match.timestamp)}
                    </time>
                  </div>
                  <strong className="rounded-md bg-emerald-100 px-1.5 py-1 text-xs tabular-nums text-emerald-800">
                    {match.confidence}%
                  </strong>
                </button>
              ))}
            </div>
          </section>
        </>
      )}
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
