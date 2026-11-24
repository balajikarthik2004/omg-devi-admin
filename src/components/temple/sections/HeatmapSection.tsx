import { useState, useEffect, useMemo, useRef } from "react";
import { densityColor, statusColor, ZONES, getZonesForTemple, type ZoneItem } from "@/lib/temple-data";
import { useJitter } from "@/lib/use-live";
import { toast } from "sonner";
import {
  Play,
  Pause,
  Users,
  UsersRound,
  Car,
  Activity,
  Maximize2,
  X,
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Video,
  Layers,
  Sparkles,
  Radio,
  SlidersHorizontal,
  ChevronRight,
  Eye,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";
import {
  BarChart,
  Bar,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from "recharts";
import { StatCard } from "../ui/StatCard";

import palaniImg from "@/assets/palani5.png";
import maduraiImg from "@/assets/Madurai.png";
import srirangamImg from "@/assets/Srirangam.png";
import arunachaleswararImg from "@/assets/Arunachaleswarar.png";
import rameswaramImg from "@/assets/Rameswaram.png";
import batuCavesImg from "@/assets/batu-caves-heatmap.jpg";
import penangHeatmapImg from "@/assets/penang-heatmap.jpg";
import { penangGroundsMap } from "./penang-map-data";

const imgMap: Record<string, string> = {
  "batu-caves-murugan": batuCavesImg,
  "penang-balathandayuthapani": penangHeatmapImg,
  "palani-murugan": palaniImg,
  "madurai-meenakshi": maduraiImg,
  srirangam: srirangamImg,
  tiruvannamalai: arunachaleswararImg,
  rameswaram: rameswaramImg,
};

function getHeatmapImage(t: any): string {
  if (!t) return batuCavesImg;
  const id = t.id || "";
  const name = (t.name || "").toLowerCase();
  if (id === "batu-caves-murugan" || name.includes("batu") || name.includes("subramaniar")) {
    return batuCavesImg;
  }
  if (
    id === "penang-balathandayuthapani" ||
    name.includes("balathandayuthapani") ||
    name.includes("penang") ||
    name.includes("thaneermalai")
  ) {
    return penangHeatmapImg;
  }
  if (imgMap[id]) return imgMap[id];
  return arunachaleswararImg;
}

const forecastData = [
  { t: "Now", v: 12450, wait: "85m", risk: "Elevated" },
  { t: "+30m", v: 13200, wait: "95m", risk: "High" },
  { t: "+60m", v: 14850, wait: "120m", risk: "Peak Surge" },
  { t: "+90m", v: 13600, wait: "100m", risk: "High" },
  { t: "+120m", v: 11300, wait: "70m", risk: "Moderate" },
];

export function HeatmapSection({ temple }: { temple?: any }) {
  const [playing, setPlaying] = useState(true);
  const [fullScreen, setFullScreen] = useState(false);
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>("sanctum");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [executedActions, setExecutedActions] = useState<Record<string, boolean>>({});
  const [refreshSpin, setRefreshSpin] = useState(false);

  const tableRef = useRef<HTMLDivElement>(null);

  const inside = useJitter(12485, 80);
  const queues = useJitter(4334, 40);
  const parking = useJitter(3820, 30);

  // Dynamic live zones with smooth drift
  const [liveZones, setLiveZones] = useState<ZoneItem[]>(() => getZonesForTemple(temple?.id));

  useEffect(() => {
    const zones = getZonesForTemple(temple?.id);
    setLiveZones(zones);
    setSelectedZoneId(zones[0]?.id || "sanctum");
  }, [temple?.id]);

  useEffect(() => {
    if (!playing) return;
    const interval = setInterval(() => {
      setLiveZones((prev) =>
        prev.map((z) => {
          if (!z.capacity) return z;
          const drift = Math.floor(Math.random() * 7) - 3;
          const nextCurrent = Math.min(z.capacity, Math.max(10, z.current + drift));
          const pct = Math.round((nextCurrent / z.capacity) * 100);
          let newStatus = z.status;
          if (pct >= 85) newStatus = "CRITICAL";
          else if (pct >= 70) newStatus = "BUSY";
          else if (pct >= 45) newStatus = "MODERATE";
          else newStatus = "NORMAL";

          return {
            ...z,
            current: nextCurrent,
            status: newStatus,
          };
        }),
      );
    }, 2500);

    return () => clearInterval(interval);
  }, [playing]);

  const handleManualRefresh = () => {
    setRefreshSpin(true);
    setTimeout(() => {
      setLiveZones(getZonesForTemple(temple?.id));
      setRefreshSpin(false);
      toast.success("AI Heatmap & sensor feeds synchronized.");
    }, 600);
  };

  const handleExecuteAction = (zone: ZoneItem) => {
    setExecutedActions((prev) => ({ ...prev, [zone.id]: true }));
    toast.success(`Action dispatched: "${zone.action}" for ${zone.name}`, {
      description: `Staff marshals notified · Queue telemetry adjusted.`,
    });
  };

  const handleSelectZone = (zoneId: string) => {
    setSelectedZoneId(zoneId);
    tableRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  };

  const filteredZones = useMemo(() => {
    return liveZones.filter((z) => {
      const matchesSearch =
        z.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        z.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        z.action.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        categoryFilter === "all" || z.category === categoryFilter;

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "critical_busy" && (z.status === "CRITICAL" || z.status === "BUSY")) ||
        (statusFilter === "moderate" && z.status === "MODERATE") ||
        (statusFilter === "normal" && (z.status === "NORMAL" || z.status === "CLEAR"));

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [liveZones, searchQuery, categoryFilter, statusFilter]);

  const activeZone = liveZones.find((z) => z.id === selectedZoneId) || liveZones[0];

  return (
    <div className="w-full max-w-full overflow-hidden space-y-6 animate-in fade-in duration-300 pb-12">
      {/* ========================================================
          1. STAT CARDS ROW (OMG TEMPLE BRAND THEME)
          ======================================================== */}
      <div className="grid grid-cols-1 min-[420px]:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 min-w-0 max-w-full">
        {/* Card 1: Inside Now — Sacred Saffron */}
        <StatCard
          icon={Users}
          label="Inside Now"
          value={inside.toLocaleString("en-IN")}
          color="text-[#F5820A]"
          bgTint="bg-[#F5820A]/10 text-[#F5820A] border border-[#F5820A]/20"
          barGradient="#F5820A"
          trend={{ up: true, text: "+12%" }}
          sub={`${Math.round((inside / 20000) * 100)}% capacity`}
          progress={Math.round((inside / 20000) * 100)}
        />

        {/* Card 2: In Queues — OMG Royal Spiritual Navy */}
        <StatCard
          icon={UsersRound}
          label="In Queues"
          value={queues.toLocaleString("en-IN")}
          color="text-primary"
          bgTint="bg-primary/10 text-primary border border-primary/20"
          barGradient="#0b3026"
          trend={{ up: false, text: "-5%" }}
          sub="54% queue load"
          progress={Math.round((queues / 8000) * 100)}
        />

        {/* Card 3: In Parking — Sacred Temple Brass Gold */}
        <StatCard
          icon={Car}
          label="In Parking"
          value={parking.toLocaleString("en-IN")}
          color="text-[#D97706]"
          bgTint="bg-[#D97706]/10 text-[#D97706] border border-[#D97706]/20"
          barGradient="#D97706"
          trend={{ up: true, text: "+8%" }}
          sub="76% slots used"
          progress={Math.round((parking / 5000) * 100)}
        />

        {/* Card 4: Total on Premises — OMG Brand Red & Signature Gradient */}
        <StatCard
          icon={Activity}
          label="Total on Premises"
          value={(inside + queues + parking).toLocaleString("en-IN")}
          color="text-[#E22E26]"
          bgTint="bg-[#E22E26]/10 text-[#E22E26] border border-[#E22E26]/20"
          barGradient="linear-gradient(90deg, #0b3026 0%, #E22E26 100%)"
          trend={{ up: true, text: "+15%" }}
          sub="Peak in 1 hr"
          progress={Math.round(((inside + queues + parking) / 33000) * 100)}
        />
      </div>

      {/* ========================================================
          2. HEATMAP RADAR & FORECAST (MAIN SECTION)
          ======================================================== */}
      <div className="grid gap-5 lg:grid-cols-[1fr_330px] min-w-0 max-w-full items-stretch">
        {/* Heatmap Map Area */}
        <div className="temple-panel flex flex-col justify-between min-w-0 max-w-full rounded-3xl border border-border/50 bg-white/70 p-4 sm:p-5 shadow-sm transition-all h-full">
          {/* Header Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 rounded-full bg-red-500/10 px-3 py-1.5 border border-red-500/20 text-red-600">
                <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                <span className="text-[10px] font-black uppercase tracking-widest">LIVE RADAR TRACKING</span>
              </div>
              <span className="hidden sm:inline-block text-xs font-semibold text-muted-foreground">
                Tiruvannamalai Arunachaleswarar Temple
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPlaying(!playing)}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all border shadow-xs cursor-pointer ${
                  playing
                    ? "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
                    : "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                }`}
                title={playing ? "Pause live drift" : "Resume live telemetry"}
              >
                {playing ? <Pause size={13} /> : <Play size={13} />}
                <span>{playing ? "Live Simulation" : "Paused"}</span>
              </button>

              <button
                type="button"
                onClick={handleManualRefresh}
                className="flex items-center gap-1.5 rounded-xl bg-white px-2.5 py-1.5 text-xs font-bold text-foreground/80 border border-border/60 hover:bg-muted/40 shadow-xs transition-colors cursor-pointer"
                title="Refresh sensor baseline"
              >
                <RefreshCw size={13} className={refreshSpin ? "animate-spin text-primary" : ""} />
              </button>

              <button
                type="button"
                onClick={() => setFullScreen(true)}
                className="temple-panel flex items-center gap-1.5 rounded-xl bg-white px-3 py-1.5 text-xs font-bold text-foreground shadow-xs hover:shadow-sm border border-border/60 hover:bg-muted/40 transition-all cursor-pointer"
              >
                <Maximize2 size={13} className="text-primary" />
                <span>Full View</span>
              </button>
            </div>
          </div>

          {/* Clean Temple Heatmap Viewport (Unobstructed View) */}
          <div className="relative w-full flex-1 rounded-2xl overflow-hidden border border-border/40 shadow-sm bg-slate-900 flex items-center justify-center min-w-0">
            <img
              src={getHeatmapImage(temple)}
              alt={`${temple?.name || "Temple"} Complex Heatmap`}
              className="w-full h-auto object-cover select-none rounded-2xl"
            />
          </div>
        </div>

        {/* Analytics & Prediction Sidebar */}
        <div className="flex flex-col justify-between gap-4 min-w-0 max-w-full h-full">
          {/* AI Crowd Forecast */}
          <div className="temple-panel rounded-3xl border border-border/50 bg-white/70 p-5 lg:p-6 shadow-sm transition-all min-w-0 max-w-full">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                <Sparkles size={12} className="text-primary" /> AI Crowd Forecast (2 Hours)
              </span>
              <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                Peak +60m
              </span>
            </div>
            <div className="mb-4 text-[13px] font-extrabold text-foreground leading-snug">
              Surge warning at +60m based on Girivalam footfall
            </div>

            <div className="h-44 w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={forecastData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis
                    dataKey="t"
                    stroke="var(--muted-foreground)"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="var(--muted-foreground)"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const d = payload[0].payload;
                      return (
                        <div className="rounded-xl border border-border bg-white/95 backdrop-blur-md p-2.5 shadow-xl text-xs">
                          <div className="font-extrabold text-foreground">{d.t} Prediction</div>
                          <div className="text-muted-foreground mt-0.5">Est. Devotees: <strong className="text-foreground">{d.v.toLocaleString("en-IN")}</strong></div>
                          <div className="text-muted-foreground">Queue Wait: <strong className="text-amber-600">{d.wait}</strong></div>
                          <div className="text-[10px] font-bold text-red-600 mt-1 uppercase tracking-wider">{d.risk} Alert</div>
                        </div>
                      );
                    }}
                  />
                  <Bar dataKey="v" radius={[6, 6, 0, 0]}>
                    {forecastData.map((f, i) => (
                      <Cell
                        key={i}
                        fill={
                          f.v > 14000
                            ? "var(--status-critical)"
                            : f.v > 13000
                            ? "var(--status-crowded)"
                            : "var(--status-normal)"
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* AI Recommended Strategy */}
          <div className="temple-panel rounded-3xl border border-border/50 bg-white/70 p-5 lg:p-6 shadow-sm flex-1 flex flex-col justify-between transition-all min-w-0 max-w-full">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">
                  Status Legend & Density
                </span>
                <span className="text-[10px] font-bold text-muted-foreground">Click to filter</span>
              </div>

              {/* Clickable Legend filters */}
              <div className="grid grid-cols-2 gap-2 text-[11px] font-extrabold uppercase tracking-wider">
                {[
                  { label: "Critical (85%+)", color: "var(--status-critical)", key: "critical_busy" },
                  { label: "Busy (70-84%)", color: "var(--status-crowded)", key: "critical_busy" },
                  { label: "Moderate (45-69%)", color: "var(--status-busy)", key: "moderate" },
                  { label: "Normal (<45%)", color: "var(--status-normal)", key: "normal" },
                ].map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => setStatusFilter(statusFilter === item.key ? "all" : item.key)}
                    className={`flex items-center gap-2 rounded-xl p-2.5 border text-left transition-all ${
                      statusFilter === item.key
                        ? "bg-primary/10 border-primary text-primary shadow-xs"
                        : "bg-muted/15 border-border/40 text-foreground/80 hover:bg-muted/30"
                    }`}
                  >
                    <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: item.color }} />
                    <span className="truncate text-[10px]">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* AI Automated Advisory Card */}
            <div className="mt-5 rounded-2xl border border-amber-200/80 bg-gradient-to-br from-amber-50 to-orange-50/50 p-4 text-xs">
              <div className="flex items-center gap-2 font-extrabold text-amber-800">
                <ShieldAlert size={15} className="text-amber-600 shrink-0" />
                <span>AI Automated Crowd Advisory</span>
              </div>
              <p className="mt-1.5 text-[11px] leading-relaxed text-amber-900/90 font-medium">
                Sanctum queue at <strong>90% capacity</strong>. Recommended: Hold queues at Vallala Gopuram and divert newly entering devotees via <strong>South Gopuram (Thirumanjana)</strong>.
              </p>
              <button
                type="button"
                onClick={() => {
                  toast.success("Crowd Balancing Protocol Executed", {
                    description: "Holding barricades deployed at Vallala Gopuram. South Gate signages illuminated.",
                  });
                }}
                className="mt-3 w-full rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 px-3 text-[11px] shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Execute Crowd Balancing Protocol</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          3. ZONE BREAKDOWN TABLE (ENHANCED & ACTIONABLE)
          ======================================================== */}
      <div ref={tableRef} className="temple-panel w-full max-w-full overflow-hidden rounded-3xl border border-border/50 bg-white/70 shadow-sm transition-all">
        {/* Table Top Toolbar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between border-b border-border/50 bg-muted/20 px-6 py-5 gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Activity size={18} />
            </div>
            <div>
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-foreground">
                Thiruvannamalai Temple Zone Breakdown
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Real-time occupancy across 4 Rajagopurams, Sanctums, Mandapams, and Parking
              </p>
            </div>
          </div>

          {/* Search & Category tabs side-by-side */}
          <div className="flex flex-wrap lg:flex-nowrap items-center gap-2 min-w-0">
            {/* Search Input */}
            <div className="relative w-44 sm:w-52 shrink-0">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search zone, gopuram..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-border/60 bg-white/90 pl-8 pr-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Category tabs placed directly next to search bar */}
            <div className="flex items-center rounded-xl bg-muted/30 p-1 border border-border/40 gap-1 text-[11px] font-bold shrink-0">
              {[
                { id: "all", label: "All" },
                { id: "gopuram", label: "Gopurams" },
                { id: "sanctum", label: "Sanctum" },
                { id: "mandapam", label: "Mandapam" },
                { id: "parking", label: "Parking" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setCategoryFilter(tab.id)}
                  className={`rounded-lg px-2.5 py-1 transition-all cursor-pointer ${
                    categoryFilter === tab.id
                      ? "bg-white text-primary shadow-xs font-black"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Reset filter button if active */}
            {(categoryFilter !== "all" || statusFilter !== "all" || searchQuery) && (
              <button
                type="button"
                onClick={() => {
                  setCategoryFilter("all");
                  setStatusFilter("all");
                  setSearchQuery("");
                }}
                className="text-xs font-bold text-primary hover:underline px-2 py-1 shrink-0"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Severity Quick Pills */}
        <div className="flex flex-wrap items-center gap-2 px-6 py-2.5 bg-muted/10 border-b border-border/40 text-[11px] font-bold">
          <span className="text-muted-foreground mr-1">Severity:</span>
          {[
            { id: "all", label: "All Zones", count: liveZones.length },
            {
              id: "critical_busy",
              label: "Critical & Busy",
              count: liveZones.filter((z) => z.status === "CRITICAL" || z.status === "BUSY").length,
            },
            {
              id: "moderate",
              label: "Moderate",
              count: liveZones.filter((z) => z.status === "MODERATE").length,
            },
            {
              id: "normal",
              label: "Normal & Clear",
              count: liveZones.filter((z) => z.status === "NORMAL" || z.status === "CLEAR").length,
            },
          ].map((pill) => (
            <button
              key={pill.id}
              type="button"
              onClick={() => setStatusFilter(pill.id)}
              className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 transition-all cursor-pointer border ${
                statusFilter === pill.id
                  ? "bg-primary text-white border-primary shadow-xs"
                  : "bg-white text-foreground/80 border-border/60 hover:bg-muted/40"
              }`}
            >
              <span>{pill.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                  statusFilter === pill.id ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
                }`}
              >
                {pill.count}
              </span>
            </button>
          ))}
        </div>

        {/* The Table */}
        <div className="w-full max-w-full overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-primary/5 text-[10px] font-black uppercase tracking-widest text-primary border-y border-primary/20">
              <tr>
                <th className="px-6 py-4 text-left whitespace-nowrap">Zone / Landmark</th>
                <th className="px-6 py-4 text-right whitespace-nowrap">Capacity</th>
                <th className="px-6 py-4 text-right whitespace-nowrap">Current Devotees</th>
                <th className="px-6 py-4 text-left whitespace-nowrap">% Full</th>
                <th className="px-6 py-4 text-center whitespace-nowrap">Status</th>
                <th className="px-6 py-4 text-center whitespace-nowrap">Est. Wait</th>
                <th className="px-6 py-4 text-left whitespace-nowrap">Recommended Action</th>
                <th className="px-6 py-4 text-center whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {filteredZones.map((z) => {
                const pct = z.capacity ? Math.round((z.current / z.capacity) * 100) : 0;
                const isSelected = selectedZoneId === z.id;
                const isExecuted = executedActions[z.id];

                return (
                  <tr
                    key={z.id}
                    onClick={() => setSelectedZoneId(z.id)}
                    className={`transition-colors cursor-pointer group ${
                      isSelected
                        ? "bg-primary/5 ring-1 ring-inset ring-primary/30"
                        : "hover:bg-muted/30"
                    }`}
                  >
                    {/* Zone & Subtitle */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ background: densityColor(pct) }}
                        />
                        <div>
                          <div className="font-extrabold text-[13px] text-foreground group-hover:text-primary transition-colors">
                            {z.name}
                          </div>
                          <div className="text-[11px] text-muted-foreground font-medium flex items-center gap-2 mt-0.5">
                            <span>{z.subtitle}</span>
                            {z.camId && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-secondary bg-secondary-tint px-1.5 py-0.2 rounded border border-secondary/20">
                                <Video size={10} /> {z.camId}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Capacity */}
                    <td className="px-6 py-4 tabular-nums font-bold text-[12px] text-right text-muted-foreground uppercase tracking-widest whitespace-nowrap">
                      {z.capacity ? z.capacity.toLocaleString("en-IN") : "—"}
                    </td>

                    {/* Current */}
                    <td className="px-6 py-4 tabular-nums font-black text-[14px] text-right text-foreground whitespace-nowrap">
                      {z.current ? z.current.toLocaleString("en-IN") : "Clear"}
                    </td>

                    {/* % Full Progress Bar */}
                    <td className="px-6 py-4 tabular-nums whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-24 h-2.5 rounded-full bg-slate-100 overflow-hidden shadow-inner">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{
                              width: `${Math.min(100, Math.max(0, pct))}%`,
                              background:
                                pct >= 85
                                  ? "#991B1B"
                                  : pct >= 70
                                  ? "#E22E26"
                                  : pct >= 45
                                  ? "#F59E0B"
                                  : "#10B981",
                            }}
                          />
                        </div>
                        <span className="text-[12px] font-black text-foreground tracking-wide min-w-[36px]">
                          {z.capacity ? `${pct}%` : "—"}
                        </span>
                      </div>
                    </td>

                    {/* Status Pill */}
                    <td className="px-6 py-4 text-center whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-black tracking-wider uppercase ${statusColor(
                          z.status,
                        )}`}
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full animate-pulse"
                          style={{
                            background:
                              pct >= 85
                                ? "#991B1B"
                                : pct >= 70
                                ? "#E22E26"
                                : pct >= 45
                                ? "#F59E0B"
                                : "#10B981",
                          }}
                        />
                        {z.status}
                      </span>
                    </td>

                    {/* Estimated Wait */}
                    <td className="px-6 py-4 text-center whitespace-nowrap font-bold text-xs text-foreground/80">
                      {z.waitTime || "—"}
                    </td>

                    {/* Action Text */}
                    <td className="px-6 py-4 text-[12px] font-bold text-muted-foreground/90 whitespace-nowrap">
                      {z.action}
                    </td>

                    {/* Interactive Action Button */}
                    <td className="px-6 py-4 text-center whitespace-nowrap">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleExecuteAction(z);
                        }}
                        className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-black transition-all shadow-xs cursor-pointer ${
                          isExecuted
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-300"
                            : z.status === "CRITICAL"
                            ? "bg-red-600 text-white hover:bg-red-700 hover:shadow-md"
                            : z.status === "BUSY"
                            ? "bg-amber-600 text-white hover:bg-amber-700 hover:shadow-md"
                            : "bg-primary text-white hover:bg-primary/90 hover:shadow-md"
                        }`}
                      >
                        {isExecuted ? (
                          <>
                            <CheckCircle2 size={13} />
                            <span>Executed</span>
                          </>
                        ) : (
                          <>
                            <span>{z.actionLabel || "Manage"}</span>
                            <ArrowRight size={12} />
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            {/* Table Footer Summary */}
            <tfoot className="bg-muted/30 border-t border-border font-bold text-xs text-foreground">
              <tr>
                <td className="px-6 py-3.5">Total across filtered zones ({filteredZones.length})</td>
                <td className="px-6 py-3.5 text-right tabular-nums text-muted-foreground">
                  {filteredZones.reduce((sum, z) => sum + z.capacity, 0).toLocaleString("en-IN")}
                </td>
                <td className="px-6 py-3.5 text-right tabular-nums font-black text-primary">
                  {filteredZones.reduce((sum, z) => sum + z.current, 0).toLocaleString("en-IN")}
                </td>
                <td className="px-6 py-3.5 tabular-nums font-bold" colSpan={5}>
                  {(() => {
                    const totalCap = filteredZones.reduce((sum, z) => sum + z.capacity, 0);
                    const totalCur = filteredZones.reduce((sum, z) => sum + z.current, 0);
                    const avgPct = totalCap ? Math.round((totalCur / totalCap) * 100) : 0;
                    return `Avg Density: ${avgPct}% Occupancy`;
                  })()}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* ========================================================
          4. FULL VIEW HIGH-RES MODAL
          ======================================================== */}
      {fullScreen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md p-4 animate-in fade-in zoom-in duration-200"
          onClick={() => setFullScreen(false)}
        >
          <button
            type="button"
            onClick={() => setFullScreen(false)}
            className="absolute top-6 right-6 text-white/70 hover:text-white p-2.5 rounded-full bg-white/10 hover:bg-white/20 transition-all cursor-pointer"
            aria-label="Close Full View"
          >
            <X size={28} />
          </button>

          <div
            className="relative max-w-[96vw] max-h-[92vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={getHeatmapImage(temple)}
              alt="High-Res Temple Radar View"
              className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl border border-white/20"
            />
            <div className="mt-3 text-center text-white/80 text-xs font-bold tracking-wide">
              {temple?.name || "Temple"} Complex — Live Surveillance & Heatmap Radar
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
