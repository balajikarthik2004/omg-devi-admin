import { useEffect, useRef, useState } from "react";
import { AlertTriangle, Camera as CameraIcon, Circle, Play, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import type { CameraStatus, Zone } from "@/lib/cctv-service";
import type { useCctv } from "@/lib/use-cctv";
import { AlertsPanel, type AlertFilter } from "../cctv/AlertsPanel";
import { CameraFocusModal } from "../cctv/CameraFocusModal";
import {
  CameraGrid,
  CctvKpiStrip,
  CctvTabs,
  CctvToolbar,
  type CameraSort,
  type GridSize,
} from "../cctv/LiveGrid";
import { PersonSearch } from "../cctv/PersonSearch";
import { isEditing, panel } from "../cctv/presentation";
import "../cctv/cctv.css";

const severity: Record<CameraStatus, number> = {
  alert: 0,
  crowded: 1,
  offline: 2,
  busy: 3,
  normal: 4,
  clear: 5,
};
const SIZE_KEY = "temple-cctv-columns";

export function CctvPage({
  data,
  now,
  user,
  alertsOpen,
  onAlertsOpenChange,
}: {
  data: ReturnType<typeof useCctv>;
  now: number;
  user: string;
  alertsOpen: boolean;
  onAlertsOpenChange: (open: boolean) => void;
}) {
  const { cameras, alerts, loading, error, retry } = data;
  const [tab, setTab] = useState("live");
  const [zone, setZone] = useState<Zone | "All">("All");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<CameraSort>("Severity");
  const [status, setStatus] = useState<CameraStatus | "All">("All");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [size, setSize] = useState<GridSize>(() => {
    try {
      const stored = Number(localStorage.getItem(SIZE_KEY));
      if (stored === 2 || stored === 3 || stored === 4) return stored;
    } catch {
      return 3;
    }
    return 3;
  });
  const [filter, setFilter] = useState<AlertFilter>("Active");
  const [highlight, setHighlight] = useState<string | null>(null);
  const [flashed, setFlashed] = useState<{ id: string; key: number } | null>(null);
  const [focus, setFocus] = useState<{ id: string; playback: boolean } | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const alertsRegion = useRef<HTMLElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(SIZE_KEY, String(size));
    } catch {
      // The current tab can use its selected grid size when storage is unavailable.
    }
  }, [size]);
  useEffect(() => {
    if (tab !== "live" || focus || alertsOpen) return;
    function keyboard(event: KeyboardEvent) {
      if (isEditing(event.target) || event.metaKey || event.ctrlKey || event.altKey) return;
      if (event.key === "/") {
        event.preventDefault();
        searchRef.current?.focus();
      } else if (event.key === "2" || event.key === "3" || event.key === "4") {
        setSize(Number(event.key) as GridSize);
        setView("grid");
      }
    }
    window.addEventListener("keydown", keyboard);
    return () => window.removeEventListener("keydown", keyboard);
  }, [tab, focus, alertsOpen]);
  useEffect(() => {
    if (!flashed) return;
    document.getElementById("tile-" + flashed.id)?.scrollIntoView({ block: "nearest" });
    const timer = setTimeout(() => setFlashed(null), 2800);
    return () => clearTimeout(timer);
  }, [flashed]);
  const inlineAlerts = tab === "live";
  useEffect(() => {
    if (inlineAlerts && alertsOpen) {
      alertsRegion.current?.focus({ preventScroll: true });
      alertsRegion.current?.scrollIntoView({ block: "nearest" });
      onAlertsOpenChange(false);
    }
  }, [inlineAlerts, alertsOpen, onAlertsOpenChange]);

  function open(id: string, playback = false) {
    previousFocus.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setFocus({ id, playback });
  }
  function closeFocus() {
    setFocus(null);
    requestAnimationFrame(() => {
      const tileButton =
        focus && document.getElementById("tile-" + focus.id)?.querySelector("button");
      const prior = previousFocus.current;
      if (prior?.isConnected && prior.getClientRects().length) prior.focus({ preventScroll: true });
      else tileButton?.focus({ preventScroll: true });
    });
  }
  function viewAlert(id: string) {
    if (focus?.id === id) return;
    setTab("live");
    setZone("All");
    setQuery("");
    setStatus("All");
    setHighlight(null);
    onAlertsOpenChange(false);
    setFlashed({ id, key: Date.now() });
    open(id);
  }

  const highPriority = new Set(
    alerts
      .filter((alert) => !alert.acknowledged && alert.severity === "high")
      .map((alert) => alert.cameraId),
  );
  const term = query.trim().toLowerCase();
  const visible = cameras
    .filter(
      (camera) =>
        (zone === "All" || zone === camera.zone) &&
        (status === "All" || status === camera.status) &&
        (!term || (camera.name + " " + camera.id).toLowerCase().includes(term)),
    )
    .sort((a, b) =>
      sort === "Name"
        ? a.name.localeCompare(b.name)
        : sort === "Count"
          ? b.count - a.count
          : severity[a.status] - severity[b.status] ||
            Number(highPriority.has(b.id)) - Number(highPriority.has(a.id)) ||
            a.id.localeCompare(b.id),
    );
  const current = cameras.find((camera) => camera.id === focus?.id);
  const active = cameras.filter((camera) => camera.online).length;
  const alertsPanelProps = {
    alerts,
    cameras,
    now,
    loading,
    filter,
    setFilter,
    onView: viewAlert,
    onHighlight: setHighlight,
  };

  return (
    <Tabs
      value={tab}
      onValueChange={setTab}
      className="cctv cctv-command flex min-w-0 flex-col gap-3"
    >
      <div className="cctv-hero">
        <span className="cctv-hero-mark" aria-hidden="true">
          ॐ
        </span>
        <div>
          <h1 className="text-2xl leading-tight font-extrabold tracking-tight sm:text-3xl">
            Security Command Center
          </h1>
          <p className="mt-1 text-xs font-medium sm:text-sm">
            AI-Powered Surveillance & Threat Detection
          </p>
        </div>
      </div>
      <div className="cctv-command-bar">
        <div
          className="cctv-status flex flex-wrap gap-2 text-xs font-bold"
          aria-label="Camera summary"
        >
          <span className="flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-emerald-800">
            <Circle size={7} fill="currentColor" /> {loading ? "—" : active} Active
          </span>
          <span className="flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-slate-700">
            <CameraIcon size={12} /> {loading ? "—" : cameras.length - active} Offline
          </span>
          <span className="flex items-center gap-1.5 rounded-full bg-red-100 px-2.5 py-1 text-red-800">
            <Radio size={12} /> Recording status unavailable
          </span>
          {cameras.some((camera) => camera.demo) && (
            <span className="flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1">
              <Play size={12} /> Demo footage
            </span>
          )}
        </div>
        <CctvTabs />
      </div>
      {error && (
        <div
          role="alert"
          className={
            panel + " flex flex-wrap items-center gap-2 border-red-200 p-3 text-sm text-red-800"
          }
        >
          <AlertTriangle size={16} /> Could not refresh CCTV data.{" "}
          <Button type="button" variant="outline" size="sm" disabled={loading} onClick={retry}>
            Retry
          </Button>
        </div>
      )}
      <TabsContent value="live" className="mt-0 min-w-0 space-y-3">
        <CctvKpiStrip cameras={cameras} alerts={alerts} now={now} loading={loading} />
        <CctvToolbar
          cameras={cameras}
          zone={zone}
          setZone={setZone}
          query={query}
          setQuery={setQuery}
          searchRef={searchRef}
          sort={sort}
          setSort={setSort}
          status={status}
          setStatus={setStatus}
          size={size}
          setSize={setSize}
          view={view}
          setView={setView}
        />
        <div className="cctv-monitor-layout">
          <CameraGrid
            cameras={visible}
            size={size}
            view={view}
            now={now}
            loading={loading}
            highlight={highlight}
            flashed={flashed}
            onOpen={open}
          />
          <aside
            ref={alertsRegion}
            tabIndex={-1}
            aria-label="Alerts panel"
            className="cctv-alert-region min-w-0 rounded-xl"
          >
            <AlertsPanel {...alertsPanelProps} inline />
          </aside>
        </div>
      </TabsContent>
      <TabsContent value="search" className="mt-0 min-w-0 data-[state=inactive]:hidden" forceMount>
        <PersonSearch
          cameras={cameras}
          now={now}
          user={user}
          onView={open}
          active={tab === "search"}
        />
      </TabsContent>
      <Sheet open={alertsOpen && !inlineAlerts} onOpenChange={onAlertsOpenChange}>
        <SheetContent className="cctv flex w-full flex-col gap-0 sm:max-w-md">
          <SheetHeader className="px-4 pr-10">
            <SheetTitle>Alerts &amp; Events</SheetTitle>
            <SheetDescription>Review and acknowledge camera alerts.</SheetDescription>
          </SheetHeader>
          <AlertsPanel {...alertsPanelProps} />
        </SheetContent>
      </Sheet>
      {current && focus && (
        <CameraFocusModal
          key={current.id}
          camera={current}
          now={now}
          initialPlayback={focus.playback}
          events={alerts.filter((event) => event.cameraId === current.id)}
          onClose={closeFocus}
          onStep={(step) => {
            const group = visible.some((camera) => camera.id === current.id) ? visible : cameras;
            const index = group.findIndex((camera) => camera.id === current.id);
            setFocus({
              id: group[(index + step + group.length) % group.length].id,
              playback: false,
            });
          }}
        />
      )}
    </Tabs>
  );
}
