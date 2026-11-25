import { useEffect, useRef, useState, type FormEvent } from "react";
import { History, ScanFace, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  getSearchAudit,
  runPersonSearch,
  type Camera,
  type CameraScan,
  type Description,
  type SearchAudit,
  type Sighting,
} from "@/lib/cctv-service";
import { DescriptionSearch, ScopeFilters, UploadPanel, type ScopeFields } from "./SearchFilters";
import { ScanProgress, SearchAuditDrawer, SearchResults } from "./SearchResults";
import { field, muted, panel, relativeTime } from "./presentation";

const emptyDescription: Description = { gender: "", age: "", top: "", bottom: "", bag: false };
const defaultScope: ScopeFields = { time: "1", from: "", to: "", confidence: 80, excluded: [] };
const reasons = ["Missing person", "Security incident", "Lost & found", "Other"];
const demoRecent = [
  { reason: "Subject search", caseRef: "VIP-042", summary: "5 sightings · Inner Sanctum & VIP Lane", age: 10 },
  { reason: "Missing person", caseRef: "MP-108", summary: "3 sightings · Main Gopuram Concourse", age: 35 },
  { reason: "Security verification", caseRef: "SV-019", summary: "2 sightings · Outer Approach", age: 70 },
];
type ScanState =
  | { stage: "idle" }
  | { stage: "scanning"; ids: string[]; scans: CameraScan[] }
  | { stage: "results"; matches: Sighting[] }
  | { stage: "error" };

export function PersonSearch({
  cameras,
  now,
  user,
  onView,
  active,
}: {
  cameras: Camera[];
  now: number;
  user: string;
  onView: (id: string) => void;
  active: boolean;
}) {
  const [mode, setMode] = useState("photo");
  const [photo, setPhoto] = useState<File | null>(null);
  const [description, setDescription] = useState(emptyDescription);
  const [scope, setScope] = useState(defaultScope);
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");
  const [caseRef, setCaseRef] = useState("");
  const [scan, setScan] = useState<ScanState>({ stage: "idle" });
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState(false);
  const [history, setHistory] = useState<SearchAudit[]>([]);
  const recentAnchor = useRef(now);
  const controller = useRef<AbortController | null>(null);
  useEffect(() => () => controller.current?.abort(), []);
  useEffect(() => {
    if (!historyOpen) return;
    let current = true;
    void getSearchAudit()
      .then((entries) => {
        if (current) setHistory(entries);
      })
      .catch(() => {
        if (current) setHistoryError(true);
      })
      .finally(() => {
        if (current) setHistoryLoading(false);
      });
    return () => {
      current = false;
    };
  }, [historyOpen, scan.stage]);

  const ids = cameras
    .filter((camera) => !scope.excluded.includes(camera.id))
    .map((camera) => camera.id);
  const from = new Date(scope.from).getTime();
  const to = new Date(scope.to).getTime();
  const dateError = scope.time === "custom" && !!scope.from && !!scope.to && !(from < to);
  const validTime = scope.time !== "custom" || from < to;
  const subject =
    mode === "photo"
      ? photo
        ? { photo }
        : null
      : Object.values(description).some(Boolean)
        ? { description }
        : null;
  const scanning = scan.stage === "scanning";
  const canStart =
    !!subject &&
    !!reason &&
    (reason !== "Other" || !!note.trim()) &&
    ids.length > 0 &&
    validTime &&
    !scanning;

  async function start(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canStart || !subject || controller.current) return;
    const current = new AbortController();
    controller.current = current;
    const submitTime = Date.now();
    setScan({ stage: "scanning", ids, scans: [] });
    try {
      const matches = await runPersonSearch(
        {
          user,
          reason: reason === "Other" ? "Other · " + note.trim() : reason,
          caseRef: caseRef.trim(),
          subject,
          scope: {
            cameraIds: ids,
            confidence: scope.confidence,
            from: scope.time === "custom" ? from : submitTime - Number(scope.time) * 3_600_000,
            to: scope.time === "custom" ? to : submitTime,
          },
        },
        (cameraScan) =>
          setScan((state) =>
            state.stage === "scanning" ? { ...state, scans: [...state.scans, cameraScan] } : state,
          ),
        current.signal,
      );
      if (!current.signal.aborted) setScan({ stage: "results", matches });
    } catch {
      if (!current.signal.aborted) setScan({ stage: "error" });
    } finally {
      controller.current = null;
    }
  }
  function reset() {
    setScan({ stage: "idle" });
    setMode("photo");
    setPhoto(null);
    setDescription(emptyDescription);
    setScope(defaultScope);
    setReason("");
    setNote("");
    setCaseRef("");
  }
  return (
    <div className="grid items-start gap-4 min-[1080px]:grid-cols-[400px_minmax(0,1fr)]">
      <section className={panel + " min-w-0 p-4 sm:p-5"}>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 text-lg font-extrabold">
            <ScanFace size={19} className="text-secondary" /> Find a Person
          </h2>
          <button
            type="button"
            onClick={() => {
              setHistoryLoading(true);
              setHistoryError(false);
              setHistoryOpen(true);
            }}
            className="inline-flex items-center gap-1 rounded text-xs font-semibold text-secondary underline-offset-4 hover:underline"
          >
            <History size={14} /> Search history
          </button>
        </div>
        <form onSubmit={(event) => void start(event)}>
          <fieldset disabled={scanning} className="min-w-0 space-y-4 disabled:opacity-70">
            <Tabs value={mode} onValueChange={setMode}>
              <TabsList
                aria-label="Person search method"
                className="h-auto w-full flex-wrap justify-start gap-1"
              >
                <TabsTrigger value="photo" className="text-xs">
                  Reference photo
                </TabsTrigger>
                <TabsTrigger value="description" className="text-xs">
                  Search by description
                </TabsTrigger>
              </TabsList>
              <TabsContent value="photo" className="mt-2">
                <UploadPanel
                  photo={photo}
                  setPhoto={setPhoto}
                  active={active && !scanning && !historyOpen}
                />
              </TabsContent>
              <TabsContent value="description" className="mt-2">
                <DescriptionSearch value={description} setValue={setDescription} />
              </TabsContent>
            </Tabs>
            <ScopeFilters cameras={cameras} value={scope} setValue={setScope} />
            {dateError && (
              <p role="alert" className="text-xs text-red-700">
                Choose an end time after the start time.
              </p>
            )}
            <fieldset className="grid min-w-0 gap-3 border-t border-border pt-3">
              <legend className="pr-2 text-sm font-extrabold">Search details</legend>
              <label className="grid gap-1 text-xs font-semibold">
                Reason for search
                <select
                  required
                  className={field}
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                >
                  <option value="">Select a reason</option>
                  {reasons.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </label>
              {reason === "Other" && (
                <label className="grid gap-1 text-xs font-semibold">
                  Note
                  <textarea
                    required
                    className={field}
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    maxLength={300}
                    rows={2}
                  />
                </label>
              )}
              <label className="grid gap-1 text-xs font-semibold">
                Case reference{" "}
                <input
                  className={field}
                  value={caseRef}
                  maxLength={80}
                  onChange={(event) => setCaseRef(event.target.value)}
                  placeholder="Optional"
                />
              </label>
            </fieldset>
            <Button type="submit" disabled={!canStart} className="w-full">
              <Search /> Start Scan
            </Button>
          </fieldset>
          <p className={"mt-2 " + muted}>Searches are logged with user, reason and time.</p>
        </form>
      </section>
      <div className="min-w-0">
        {scan.stage === "idle" && (
          <section className={panel + " p-4 sm:p-5"}>
            <div className="flex items-center gap-3 rounded-lg border border-dashed border-secondary/25 bg-secondary-tint/45 p-4">
              <ScanFace size={24} className="shrink-0 text-secondary" />
              <div>
                <h3 className="text-sm font-extrabold">Ready to scan</h3>
                <p className={muted}>
                  Use a photo or description to look for a missing person across selected cameras.
                </p>
              </div>
            </div>
            <h3 className="mt-5 text-sm font-extrabold">Recent searches</h3>
            <ul className="mt-2 divide-y divide-border">
              {demoRecent.map((entry) => (
                <li key={entry.caseRef} className="flex justify-between gap-2 py-2.5 text-xs">
                  <div>
                    <strong>{entry.reason}</strong>
                    <p className={muted}>
                      {entry.caseRef} · {entry.summary}
                    </p>
                  </div>
                  <span className={"shrink-0 " + muted}>
                    {relativeTime(recentAnchor.current - entry.age * 60_000, now)}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}
        {scan.stage === "scanning" && <ScanProgress ids={scan.ids} scans={scan.scans} />}
        {scan.stage === "results" && (
          <SearchResults matches={scan.matches} now={now} onView={onView} onReset={reset} />
        )}
        {scan.stage === "error" && (
          <p role="alert" className={panel + " p-4 text-sm text-red-700"}>
            Scan failed. Select Start Scan to retry.
          </p>
        )}
      </div>
      <SearchAuditDrawer
        open={historyOpen}
        onOpenChange={setHistoryOpen}
        entries={history}
        loading={historyLoading}
        error={historyError}
      />
    </div>
  );
}
