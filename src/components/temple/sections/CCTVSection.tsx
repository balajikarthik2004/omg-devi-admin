import { useEffect, useRef, useState } from "react";
import { AlertTriangle, Camera as CameraIcon, Circle, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
<<<<<<< HEAD
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
const DESKTOP_ALERTS = "(min-width: 1280px)";

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
  const [size, setSize] = useState<GridSize>(() => {
    try {
      const stored = Number(localStorage.getItem(SIZE_KEY));
      if (stored === 2 || stored === 3 || stored === 4) return stored;
    } catch {
      return 3;
    }
    return 3;
  });
  const [desktop, setDesktop] = useState(() => matchMedia(DESKTOP_ALERTS).matches);
  const [filter, setFilter] = useState<AlertFilter>("Active");
  const [highlight, setHighlight] = useState<string | null>(null);
  const [flashed, setFlashed] = useState<{ id: string; key: number } | null>(null);
  const [focus, setFocus] = useState<{ id: string; playback: boolean } | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const desktopAlerts = useRef<HTMLElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const media = matchMedia(DESKTOP_ALERTS);
    const change = () => setDesktop(media.matches);
    media.addEventListener("change", change);
    return () => media.removeEventListener("change", change);
  }, []);
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
  const inlineAlerts = desktop && tab === "live";
  useEffect(() => {
    if (inlineAlerts && alertsOpen) {
      desktopAlerts.current?.focus({ preventScroll: true });
      desktopAlerts.current?.scrollIntoView({ block: "nearest" });
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
=======
  Maximize2,
  Camera,
  Bell,
  ZoomIn,
  Search,
  Image as ImageIcon,
  ScanFace,
  UploadCloud,
  UserSearch,
  Target,
  Activity,
  Users,
  ActivityIcon,
  AlertTriangle,
  Crosshair,
  X,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Radio,
} from "lucide-react";
import { toast } from "sonner";
import cctvMatch1 from "@/assets/cctv_match_1.png";
import cctvMatch2 from "@/assets/cctv_match_2.png";
import cctvMatch3 from "@/assets/cctv_match_3.png";

const matchImages = [cctvMatch1, cctvMatch2, cctvMatch3];
const alerts = [
  {
    cam: "CAM-P02",
    color: "danger",
    time: "14:28",
    msg: "Queue Lane A overcrowding detected. Density exceeds safe limit.",
  },
  {
    cam: "CAM-P01",
    color: "status-busy",
    time: "14:15",
    msg: "Rapid crowd inflow surge at Main Gopuram. +42 people in last 3 minutes.",
  },
];
const matchResults = [
  {
    cam: "CAM-P04",
    name: "Inner Sanctum Approach",
    time: "14:32:15",
    conf: 98,
    status: "High Match",
  },
  { cam: "CAM-P02", name: "Queue Lane A", time: "14:15:02", conf: 84, status: "Possible Match" },
  {
    cam: "CAM-P12",
    name: "Footwear Counter",
    time: "13:58:44",
    conf: 76,
    status: "Low Confidence",
  },
];
function CCTVFeed({
  idx,
  status,
  camId,
  camName,
  scanOverlay = false,
  onExpand,
}: {
  idx: number;
  status: string;
  camId?: string;
  camName?: string;
  scanOverlay?: boolean;
  onExpand?: () => void;
}) {
  const videoSrc =
    camId === "CAM-P06"
      ? "/videos/cam-parking.mp4"
      : idx % 2 === 0
      ? "/videos/cam-crowd.mp4"
      : "/videos/cam-people.mp4";

  const boxes = Array.from({
    length: status === "CRITICAL" ? 6 : status === "CROWDED" ? 7 : status === "BUSY" ? 5 : 3,
  }).map((_, i) => ({
    x: 12 + ((idx * 17 + i * 21) % 72),
    y: 18 + ((idx * 11 + i * 19) % 55),
    w: 9 + ((i * 3) % 6),
    h: 18 + ((i * 5) % 8),
  }));

  return (
    <div
      onClick={onExpand}
      className="group/feed relative aspect-video w-full overflow-hidden rounded-xl bg-black ring-1 ring-border/50 shadow-inner cursor-pointer"
    >
      {/* Real Video Stream */}
      <video
        src={videoSrc}
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 h-full w-full object-cover filter contrast-[1.05] brightness-[0.98] transition-transform duration-700 group-hover/feed:scale-105"
      />

      {/* Subtle CCTV vignette overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/60 pointer-events-none" />

      {/* Dynamic AI Detection Boxes */}
      {boxes.map((b, i) => {
        const isSuspicious = status === "CRITICAL" && i === 2;
        return (
          <div
            key={i}
            className={`animate-track absolute border-[1.5px] transition-all pointer-events-none ${
              isSuspicious
                ? "border-danger shadow-[0_0_12px_rgba(226,46,40,0.8)] z-10"
                : "border-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.5)]"
            }`}
            style={{
              left: `${b.x}%`,
              top: `${b.y}%`,
              width: `${b.w}%`,
              height: `${b.h}%`,
              animationDelay: `${i * 0.4}s`,
              animationDuration: `${5 + (i % 4)}s`,
            }}
          >
            <div
              className={`absolute -top-3.5 left-0 px-1 py-[1px] text-[7px] font-black text-white whitespace-nowrap rounded-[2px] ${
                isSuspicious ? "bg-danger animate-pulse" : "bg-emerald-600/90"
              }`}
            >
              ID:{idx}{i} {isSuspicious ? "⚠️ ALERT" : "PERSON 98%"}
            </div>
          </div>
        );
      })}

      {/* Scanning Laser Line when Alerted */}
      {scanOverlay && (
        <div className="absolute inset-0 z-10 pointer-events-none bg-danger/10">
          <div className="h-full w-full bg-[linear-gradient(transparent_50%,rgba(226,46,40,0.15)_50%)] bg-[length:100%_4px] mix-blend-screen opacity-70" />
          <div className="absolute left-0 right-0 h-0.5 bg-danger shadow-[0_0_12px_rgba(226,46,40,0.9)] animate-scan" />
        </div>
      )}

      {/* Top Left: REC + Quality Status */}
      <div className="absolute left-2.5 top-2.5 flex items-center gap-2 pointer-events-none z-10">
        <div className="flex items-center gap-1.5 rounded-md bg-black/75 px-2 py-0.5 text-[9px] font-bold text-white backdrop-blur-md ring-1 ring-white/10">
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              status === "CRITICAL"
                ? "bg-danger animate-pulse shadow-[0_0_6px_rgba(226,46,40,0.9)]"
                : "bg-emerald animate-pulse shadow-[0_0_6px_rgba(16,185,129,0.8)]"
            }`}
          />
          REC
        </div>
        <span className="rounded bg-black/60 px-1.5 py-0.5 text-[8px] font-mono font-bold text-white/90 backdrop-blur-sm border border-white/10">
          1080p · 25 FPS
        </span>
      </div>

      {/* Top Right: Full View button on hover */}
      <div className="absolute right-2.5 top-2.5 opacity-0 group-hover/feed:opacity-100 transition-opacity z-10">
        <span className="rounded-md bg-black/80 px-2 py-0.5 text-[9px] font-bold text-white backdrop-blur-md border border-white/20 flex items-center gap-1 shadow-lg">
          <Maximize2 size={10} /> Inspect
        </span>
      </div>

      {/* Bottom Telemetry Bar */}
      <div className="absolute inset-x-2.5 bottom-2 flex items-center justify-between text-[8px] font-mono text-white/90 pointer-events-none z-10">
        <span className="font-semibold tracking-wider text-emerald-400">
          AI TRACKING: ACTIVE
        </span>
        <span className="text-white/70">
          H.264 · 4.2 Mbps
        </span>
      </div>
    </div>
  );
}

export function CCTVSection() {
  const now = useLiveClock();
  const timeStr = now.toLocaleTimeString("en-IN", { hour12: false });
  const [tab, setTab] = useState<"live" | "search">("live");
  const [searchState, setSearchState] = useState<"idle" | "scanning" | "results">("idle");
  const [scanProgress, setScanProgress] = useState(0);
  const [targetImage, setTargetImage] = useState<string | null>(null);
  const [inspectedCam, setInspectedCam] = useState<any | null>(null);
  const [modalMuted, setModalMuted] = useState(true);
  const [hardwareInfoOpen, setHardwareInfoOpen] = useState(false);
  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTargetImage(reader.result as string);
        setSearchState("scanning");
        setScanProgress(0);
        toast.success("Subject image acquired. Deep scanning 12 active feeds...");
      };
      reader.readAsDataURL(file);
    }
>>>>>>> fdd6855715257b11d5242fc9ae3c6e710aa57b41
  };

  return (
    <Tabs value={tab} onValueChange={setTab} className="cctv flex min-w-0 flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl leading-tight font-extrabold tracking-tight sm:text-3xl">
            Security Command Center
          </h1>
          <p className="mt-1 text-xs font-medium text-muted-foreground sm:text-sm">
            AI-Powered Surveillance & Threat Detection
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5 text-[10px] font-bold">
            <span className="flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-emerald-800">
              <Circle size={7} fill="currentColor" /> {loading ? "—" : active} Active
            </span>
            <span className="flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-slate-700">
              <CameraIcon size={12} /> {loading ? "—" : cameras.length - active} Offline
            </span>
            <span className="flex items-center gap-1.5 rounded-full bg-red-100 px-2.5 py-1 text-red-800">
              <Radio size={12} /> Recording All
            </span>
            {cameras.some((camera) => camera.demo) && (
              <span className="rounded-full border border-secondary/20 bg-card px-2.5 py-1 text-secondary">
                Demo footage
              </span>
            )}
          </div>
        </div>
        <CctvTabs />
      </div>
<<<<<<< HEAD
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
=======
      {tab === "live" ? (
        <div className="grid gap-8 xl:grid-cols-[1fr_320px]">
          {/* Camera Grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {CCTV_CAMERAS.map((c, i) => {
              const isAlert = c.id === activeAlert;
              return (
              <div
                key={c.id}
                className={`group flex flex-col justify-between rounded-xl border p-5 shadow-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-xl relative overflow-hidden ${
                  isAlert 
                    ? "border-danger ring-2 ring-danger/50 shadow-[0_0_30px_rgba(255,0,0,0.4)] animate-pulse bg-danger/5" 
                    : "border-border/50 bg-white/60 backdrop-blur-xl"
                }`}
              >
                <CCTVFeed idx={i} status={isAlert ? "CRITICAL" : c.status} camId={c.id} camName={c.name} scanOverlay={isAlert} onExpand={() => setInspectedCam(c)} />
                <div className="mt-3 flex items-start justify-between">
                  <div>
                    <div className={`text-[9px] font-semibold tracking-widest uppercase ${isAlert ? "text-danger" : "text-muted-foreground"}`}>{c.id}</div>
                    <div className={`mt-1 text-[13px] font-bold tracking-tight leading-tight ${isAlert ? "text-danger" : "text-foreground"}`}>
                      {c.name}
                    </div>
                  </div>
                  <span
                    className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[8px] font-semibold uppercase tracking-widest ${c.status === "CROWDED" ? "bg-red-50 text-red-600 border-red-100" :
                      c.status === "BUSY" ? "bg-amber-50 text-amber-600 border-amber-100" :
                        "bg-emerald-50 text-emerald-600 border-emerald-100"
                      }`}
                  >
                    {c.status}
                  </span>
                </div>
                <div className="mt-2.5 flex items-center justify-between border-t border-border/50 pt-2.5 text-[11px] font-medium text-muted-foreground">
                  <span className="flex items-center gap-1.5 text-muted-foreground/80">
                    <UserSearch size={14} className="text-muted-foreground/60" />
                    {c.type === "people" ? `${c.count} detected` : `${c.count} vehicles`}
                  </span>
                  <span className="font-mono text-[10px] tracking-wider text-muted-foreground/70">{timeStr}</span>
                </div>
                <div className="mt-3 grid grid-cols-4 gap-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  {[
    { Icon: ZoomIn, action: () => setInspectedCam(c), tip: "Zoom" },
    { Icon: Camera, action: () => toast.success("Snapshot captured & logged to incident report"), tip: "Snapshot" },
    { Icon: Bell, action: () => toast.info("Guard dispatch alert triggered for " + c.name), tip: "Alert" },
    { Icon: Maximize2, action: () => setInspectedCam(c), tip: "Maximize" }
  ].map(({ Icon, action, tip }, j) => (
                    <button
                      key={j}
                      className="flex h-8 items-center justify-center rounded-lg bg-muted/80 text-muted-foreground border border-border/50 transition-all hover:bg-surface hover:text-foreground hover:shadow-lg hover:-translate-y-0.5"
                    >
                      <Icon size={18} />
                    </button>
                  ))}
                </div>
              </div>
            );
            })}
          </div>
          {/* Analytics Sidebar */}
          <div className="flex flex-col gap-8">
            <div className="grid grid-cols-2 gap-8">
              {[
                { l: "Total Detected", v: "1,739", c: "text-amber-600", i: Users },
                { l: "In Queues", v: "398", c: "text-indigo-600", i: ActivityIcon },
                { l: "Anomalies", v: "2", c: "text-red-600", i: AlertTriangle },
                { l: "Avg Density", v: "63%", c: "text-amber-600", i: Crosshair },
              ].map((s) => (
                <div
                  key={s.l}
                  className="group rounded-xl border border-border/50 bg-white/60 backdrop-blur-xl p-6 shadow-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-[9px] font-semibold text-muted-foreground uppercase tracking-widest">{s.l}</div>
                    <div className={`flex h-10 w-10 items-center justify-center rounded-2xl bg-muted/30 border border-border/50 transition-colors group-hover:opacity-80 ${s.c}`}>
                      <s.i size={18} />
                    </div>
                  </div>
                  <div
                    className={`text-2xl font-bold tracking-tight ${s.c} tabular-nums`}
                  >
                    {s.v}
                  </div>
                </div>
              ))}
            </div>
            <div className="rounded-xl border border-border/50 bg-white/60 backdrop-blur-xl p-8 shadow-sm flex-1 transition-all duration-500 hover:shadow-xl">
              <div className="mb-6 text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">Critical Alerts</div>
              <div className="space-y-3">
                {alerts.map((a, i) => (
                  <div
                    key={i}
                    className={`rounded-2xl border ${a.color === 'danger' ? 'border-red-100 bg-red-50' : 'border-amber-100 bg-amber-50'} p-6 text-[12px] font-medium`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`${a.color === 'danger' ? 'text-red-600' : 'text-amber-600'} text-[10px] font-semibold uppercase tracking-widest`}>{a.cam}</span>
                      <span className="font-mono text-[10px] text-muted-foreground">{a.time}</span>
                    </div>
                    <div className="mt-1.5 leading-relaxed text-foreground/90">
                      {a.msg}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* AI Person Search Tab */ <div className="grid gap-8 lg:grid-cols-[380px_1fr]">
          {/* Upload & Controls */}
          <div className="rounded-xl border border-border/50 bg-white/60 backdrop-blur-xl p-8 shadow-sm flex flex-col transition-all duration-500 hover:shadow-xl">
            <div className="mb-8">
              <h2 className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">AI Facial Search</h2>
              <p className="mt-2 text-[12px] font-medium text-foreground leading-relaxed">
                Upload a clear photo of a person. The AI will scan the last 24 hours of footage
                across all 12 cameras.
              </p>
            </div>
            {searchState === "idle" ? (
              <label className="group flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border/60 bg-surface/50 px-6 py-10 transition-all hover:border-info/50 hover:bg-info/5 cursor-pointer relative overflow-hidden">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <div className="rounded-xl bg-surface p-8 shadow-sm transition-transform group-hover:scale-110">
                  <UploadCloud size={32} className="text-muted-foreground group-hover:text-info" />
                </div>
                <div className="mt-3 text-[12px] font-semibold text-foreground">
                  Click to upload target photo
                </div>
                <div className="mt-1 text-[10px] text-muted-foreground">
                  Select a JPG, PNG, or WEBP file
                </div>
              </label>
            ) : (
              <div className="flex flex-col items-center rounded-xl border border-border bg-surface p-8">
                <div className="relative h-32 w-32 overflow-hidden rounded-xl border-4 border-info shadow-[0_0_20px_rgba(0,191,255,0.3)] bg-card">
                  {targetImage ? (
                    <img
                      src={targetImage}
                      alt="Target Subject"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-muted flex items-center justify-center">
                      <UserSearch size={48} className="text-muted-foreground opacity-50" />
                    </div>
                  )}
                  {searchState === "scanning" && (
                    <div className="absolute left-0 right-0 h-1 bg-info shadow-[0_0_15px_#00bfff] animate-scan mix-blend-screen opacity-80" />
                  )}
                </div>
                <div className="mt-6 w-full text-center">
                  <div className="text-[12px] font-semibold text-foreground">Target Subject Acquired</div>
                  <div className="mt-1 text-[10px] text-info font-normal">Tracking ID: SUB-8942-A</div>
                </div>
                {searchState === "results" && (
                  <button
                    onClick={resetSearch}
                    className="mt-6 w-full rounded-xl border border-border bg-card px-4 py-2 text-xs font-semibold transition-colors hover:bg-muted"
                  >
                    New Search
                  </button>
                )}
              </div>
            )}
          </div>
          {/* Scanning & Results View */}
          <div className="rounded-xl border border-border/50 bg-white/60 backdrop-blur-xl p-8 shadow-sm min-h-[500px] flex flex-col transition-all duration-500 hover:shadow-xl">
            {searchState === "idle" && (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <Target size={48} className="mb-4 text-muted-foreground/30" />
                <div className="text-[12px] font-semibold text-foreground">
                  Awaiting Target Image
                </div>
                <div className="mt-1 text-[9px] font-medium uppercase tracking-widest text-muted-foreground">
                  Upload a photo to begin deep scanning network
                </div>
              </div>
            )}
            {searchState === "scanning" && (
              <div className="flex h-full flex-col justify-center">
                <div className="mb-10 relative">
                  <div className="relative rounded-2xl bg-white border border-border/60 p-8 shadow-sm overflow-hidden">
                    <div className="relative flex items-center justify-between text-foreground mb-6">
                      <span className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-foreground/80">
                        <ScanFace size={20} className="text-primary animate-pulse" /> Deep Neural Scan Running
                      </span>
                      <span className="font-mono text-2xl font-extrabold tabular-nums text-primary">
                        {scanProgress.toString().padStart(2, '0')}%
                      </span>
                    </div>

                    <div className="relative h-3 w-full rounded-full bg-muted overflow-hidden shadow-inner border border-border/40">
                      <div
                        className="absolute top-0 left-0 h-full bg-primary transition-all duration-300 ease-out"
                        style={{ width: `${scanProgress}%` }}
                      >
                        <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.3),transparent)] animate-scan" />
                      </div>
                    </div>

                    <div className="mt-4 flex justify-between text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">
                      <span>Analyzing Node {Math.floor(scanProgress / 10)}</span>
                      <span>{scanProgress > 50 ? 'Identifying Signatures...' : 'Isolating Variables...'}</span>
                      <span>{scanProgress === 100 ? 'Complete' : 'Processing...'}</span>
                    </div>
                  </div>
                </div>
                <div className="mt-12 grid grid-cols-4 gap-8 opacity-50">
                  {CCTV_CAMERAS.slice(0, 4).map((c, i) => (
                    <div key={i} className="opacity-70 grayscale">
                      <CCTVFeed idx={i} status="NORMAL" camId={c.id} camName={c.name} scanOverlay={true} />
                      <div className="mt-2 text-center text-[9px] font-mono text-muted-foreground">
                        SCANNING {c.id}...
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {searchState === "results" && (
              <div className="flex h-full flex-col">
                <div className="mb-6 flex items-center justify-between border-b border-border pb-4">
                  <div className="text-sm font-semibold text-foreground">Match Results</div>
                  <div className="rounded-xl bg-info/10 px-3 py-1 text-[10px] font-medium text-info border border-info/30">
                    3 Matches Found
                  </div>
                </div>
                <div className="space-y-4">
                  {matchResults.map((m, i) => (
                    <div
                      key={i}
                      className="flex flex-col sm:flex-row gap-8 rounded-xl border border-border bg-surface p-8 transition-all hover:shadow-md hover:border-info/30 group"
                    >
                      <div className="w-full sm:w-48 shrink-0 relative aspect-video rounded-xl overflow-hidden ring-1 ring-border shadow-inner">
                        <img
                          src={matchImages[i]}
                          alt="Match"
                          className="w-full h-full object-cover grayscale opacity-90"
                        />
                        <div
                          className="absolute inset-0 opacity-10 mix-blend-multiply"
                          style={{
                            backgroundImage:
                              "radial-gradient(circle at 20% 30%, rgba(0,0,0,0.08) 0, transparent 50%), radial-gradient(circle at 80% 70%, rgba(0,0,0,0.05) 0, transparent 60%)",
                          }}
                        />

                        <div className="absolute left-[35%] top-[15%] w-[30%] h-[70%] border border-black/80 animate-pulse">
                          <div className="absolute -top-4 left-0 bg-black/90 px-1.5 py-[2px] text-[8px] font-semibold text-white whitespace-nowrap">
                            ID: TGT-{8942 + i}
                          </div>
                          <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-black -translate-x-[1px] -translate-y-[1px]"></div>
                          <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-black translate-x-[1px] -translate-y-[1px]"></div>
                          <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-black -translate-x-[1px] translate-y-[1px]"></div>
                          <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-black translate-x-[1px] translate-y-[1px]"></div>
                        </div>

                        <div className="absolute left-2 top-2 flex items-center gap-1.5 rounded-sm bg-black/80 px-2 py-0.5 text-[9px] font-semibold text-white backdrop-blur-md ring-1 ring-white/10">
                          <span className="blink-rec h-1.5 w-1.5 rounded-xl bg-danger shadow-[0_0_5px_rgba(255,0,0,0.8)]" />{" "}
                          REC
                        </div>
                      </div>
                      <div className="flex flex-1 flex-col justify-center">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="font-semibold text-foreground text-xs">{m.name}</div>
                            <div className="mt-1 text-[10px] font-mono text-muted-foreground">
                              {m.cam} • {m.time}
                            </div>
                          </div>
                          <div className="flex flex-col items-end">
                            <div
                              className={`text-sm font-bold tabular-nums ${m.conf > 90 ? "text-emerald" : m.conf > 80 ? "text-saffron" : "text-status-busy"}`}
                            >
                              {m.conf}%
                            </div>
                            <div className="text-[10px] font-semibold text-muted-foreground">
                              Confidence
                            </div>
                          </div>
                        </div>
                        <div className="mt-2 flex gap-2">
                          <button className="flex items-center gap-1.5 rounded bg-info px-3 py-1.5 text-[9px] font-medium text-white shadow-sm transition-opacity hover:opacity-90">
                            <ZoomIn size={12} /> View Frame
                          </button>
                          <button className="flex items-center gap-1.5 rounded border border-border bg-card px-3 py-1.5 text-[9px] font-medium text-foreground transition-colors hover:bg-muted">
                            Track Route
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
>>>>>>> fdd6855715257b11d5242fc9ae3c6e710aa57b41
        </div>
      )}
      <TabsContent value="live" className="mt-0 min-w-0 space-y-4">
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
          size={size}
          setSize={setSize}
        />
        <div className="grid min-w-0 items-start gap-4 min-[1280px]:grid-cols-[minmax(0,1fr)_360px]">
          <CameraGrid
            cameras={visible}
            size={size}
            now={now}
            loading={loading}
            highlight={highlight}
            flashed={flashed}
            onOpen={open}
          />
          {inlineAlerts && (
            <aside
              ref={desktopAlerts}
              tabIndex={-1}
              aria-label="Alerts panel"
              className="sticky top-[5.5rem] min-w-0 rounded-xl"
            >
              <AlertsPanel {...alertsPanelProps} inline />
            </aside>
          )}
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
            <SheetTitle>Alerts</SheetTitle>
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
