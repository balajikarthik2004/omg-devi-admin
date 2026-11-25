import { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ReferenceLine,
} from "recharts";
import { toast } from "sonner";
import {
  Activity,
  Clock,
  Users,
  Car,
  Gauge,
  TrendingUp,
  TrendingDown,
  Plus,
  Pause,
  Megaphone,
  Merge,
  Siren,
  AlertOctagon,
  Timer,
  Sparkles,
} from "lucide-react";
import { useJitter, useLiveClock } from "@/lib/use-live";
import type { Temple } from "@/lib/temple-data";
import { StatCard } from "../ui/StatCard";
const footfallAllData = [
  { t: "5 AM", actual: 300, forecast: null, total: 300 },
  { t: "6 AM", actual: 800, forecast: null, total: 800 },
  { t: "7 AM", actual: 2400, forecast: null, total: 2400 },
  { t: "8 AM", actual: 6800, forecast: null, total: 6800 },
  { t: "9 AM", actual: 11200, forecast: null, total: 11200 },
  { t: "10 AM", actual: 14800, forecast: null, total: 14800 },
  { t: "11 AM", actual: 13900, forecast: null, total: 13900 },
  { t: "12 PM", actual: 11200, forecast: null, total: 11200 },
  { t: "1 PM", actual: 9400, forecast: null, total: 9400 },
  { t: "2 PM", actual: 12450, forecast: 12450, total: 12450, isCurrent: true },
  { t: "3 PM", actual: null, forecast: 11800, total: 11800 },
  { t: "4 PM", actual: null, forecast: 12600, total: 12600 },
  { t: "5 PM", actual: null, forecast: 14900, total: 14900 },
  { t: "6 PM", actual: null, forecast: 16400, total: 16400, isPeak: true },
  { t: "7 PM", actual: null, forecast: 13200, total: 13200 },
  { t: "8 PM", actual: null, forecast: 9400, total: 9400 },
  { t: "9 PM", actual: null, forecast: 4200, total: 4200 },
];

const queueTrendData = [
  { t: "9:00 AM", common: 32, special20: 26, quick100: 16, vip: 5, avg: 20 },
  { t: "9:30 AM", common: 38, special20: 30, quick100: 18, vip: 5, avg: 23 },
  { t: "10:00 AM", common: 46, special20: 35, quick100: 22, vip: 6, avg: 27 },
  { t: "10:30 AM", common: 49, special20: 39, quick100: 25, vip: 7, avg: 30 },
  { t: "11:00 AM", common: 45, special20: 36, quick100: 24, vip: 6, avg: 28 },
  { t: "11:30 AM", common: 41, special20: 32, quick100: 22, vip: 6, avg: 25 },
  { t: "12:00 PM", common: 39, special20: 31, quick100: 20, vip: 5, avg: 24 },
  { t: "12:30 PM", common: 36, special20: 29, quick100: 19, vip: 5, avg: 22 },
  { t: "1:00 PM", common: 42, special20: 34, quick100: 22, vip: 7, avg: 26 },
  { t: "1:30 PM", common: 47, special20: 40, quick100: 25, vip: 7, avg: 30 },
  { t: "2:00 PM", common: 50, special20: 43, quick100: 27, vip: 8, avg: 32 },
  { t: "2:30 PM", common: 52, special20: 46, quick100: 28, vip: 8, avg: 34, isLive: true },
];

function CustomFootfallTooltip({ active, payload, label }: any) {
  if (!active || !payload || !payload.length) return null;
  const data = payload[0]?.payload;
  const isForecast = data?.actual === null && data?.forecast !== null;
  const isCurrent = data?.isCurrent;
  const val = data?.actual ?? data?.forecast ?? 0;

  return (
    <div className="rounded-xl border border-white/20 bg-[#0F172A]/95 p-3.5 text-white shadow-2xl backdrop-blur-xl min-w-[210px]">
      <div className="flex items-center justify-between pb-2 border-b border-white/10">
        <div className="flex items-center gap-1.5 font-bold text-xs text-slate-300">
          <Clock size={13} className="text-primary" />
          <span>{label}</span>
        </div>
        <span
          className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider ${
            isCurrent
              ? "bg-primary/20 text-primary border border-primary/40 animate-pulse"
              : isForecast
              ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
              : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
          }`}
        >
          {isCurrent ? "● Live Now" : isForecast ? "AI Forecast" : "Recorded"}
        </span>
      </div>

      <div className="pt-2.5">
        <div className="text-[11px] font-medium text-slate-400">Devotee Inflow Rate</div>
        <div className="flex items-baseline gap-1.5 mt-0.5">
          <span className="text-2xl font-black tracking-tight text-white">{val.toLocaleString()}</span>
          <span className="text-[11px] font-semibold text-slate-400">devotees/hr</span>
        </div>
      </div>

      {data?.isPeak && (
        <div className="mt-2.5 flex items-center gap-1.5 text-[10px] font-bold text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2 py-1 rounded-md">
          <TrendingUp size={12} className="text-amber-400" /> Projected Peak Hour of the Day
        </div>
      )}
    </div>
  );
}

function CustomQueueTooltip({ active, payload, label }: any) {
  if (!active || !payload || !payload.length) return null;
  const data = payload[0]?.payload;

  return (
    <div className="rounded-xl border border-white/20 bg-[#0F172A]/95 p-3.5 text-white shadow-2xl backdrop-blur-xl min-w-[220px]">
      <div className="flex items-center justify-between pb-2 border-b border-white/10">
        <div className="flex items-center gap-1.5 font-bold text-xs text-slate-300">
          <Timer size={13} className="text-indigo-300" />
          <span>{label}</span>
        </div>
        {data?.isLive ? (
          <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-primary/20 text-primary border border-primary/40 animate-pulse">
            ● Current
          </span>
        ) : (
          <span className="text-[10px] font-semibold text-slate-400">Recorded</span>
        )}
      </div>

      <div className="space-y-1.5 pt-2.5">
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1.5 text-slate-300 font-medium">
            <span className="h-2 w-2 rounded-full bg-[#E22E28]" /> Common Darshan
          </span>
          <span className={`font-black ${data?.common >= 45 ? "text-[#E22E28]" : "text-white"}`}>
            {data?.common} mins
          </span>
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1.5 text-slate-300 font-medium">
            <span className="h-2 w-2 rounded-full bg-[#3B82F6]" /> ₹20 Darshan
          </span>
          <span className="font-black text-white">{data?.special20} mins</span>
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1.5 text-slate-300 font-medium">
            <span className="h-2 w-2 rounded-full bg-[#10B981]" /> ₹100 Darshan
          </span>
          <span className="font-black text-white">{data?.quick100} mins</span>
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1.5 text-slate-300 font-medium">
            <span className="h-2 w-2 rounded-full bg-[#F59E0B]" /> VIP Darshan
          </span>
          <span className="font-black text-white">{data?.vip} mins</span>
        </div>
      </div>

      <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
        <span>Average Wait</span>
        <span className="font-extrabold text-white">{data?.avg} mins</span>
      </div>
    </div>
  );
}
const activityFeed = [
  {
    t: "14:32",
    c: "emerald",
    msg: "Crowd normalized at South Entrance. Common Darshan queue reducing.",
  },
  { t: "14:28", c: "status-busy", msg: "₹20 Ticket Darshan wait time increased to 52 minutes." },
  { t: "14:21", c: "danger", msg: "Peak crowd alert: Inner sanctum approaching capacity limit." },
  {
    t: "14:15",
    c: "info",
    msg: "8 volunteers Added to ₹100 Ticket Darshan per AI recommendation.",
  },
  { t: "14:08", c: "emerald", msg: "Parking Lot A returned to 70% after overflow activation." },
  { t: "14:02", c: "status-busy", msg: "Kovil Nandi entrance crowd density: 78%." },
  { t: "13:55", c: "info", msg: "AI forecast: Evening rush expected at 17:30–19:00." },
  { t: "13:48", c: "emerald", msg: "Morning peak crowd dissipated. Wait time reduced to 28 min." },
];
const suggestions = [
  {
    kind: "URGENT",
    border: "border-danger",
    title: "Open Gate 3 — North Entrance",
    body: "580 people in North queue. Will overflow in 8 mins.",
    action: "Open Gate 3",
  },
  {
    kind: "WARNING",
    border: "border-status-busy",
    title: "Add 6 More Volunteers",
    body: "Not enough staff at Common & ₹20 Darshan.",
    action: "Notify Staff",
  },
  {
    kind: "INFO",
    border: "border-info",
    title: "Evening Rush Preparation",
    body: "Expect 3,200 more devotees at 05:30. Position staff by 05:00.",
    action: "Set Reminder",
  },
  {
    kind: "SUCCESS",
    border: "border-emerald",
    title: "Parking Overflow Not Needed",
    body: "Current inflow rate slowing. Lot A will stabilize at ~80% capacity.",
    action: "Dismiss",
  },
];

const lanes = [
  {
    name: "Common Darshan",
    waiting: 620,
    max: 800,
    wait: 52,
    vols: 8,
    status: "ACTIVE",
    bgTint: "bg-saffron/10",
  },
  {
    name: "₹20 Darshan",
    waiting: 540,
    max: 800,
    wait: 46,
    vols: 6,
    status: "ACTIVE",
    bgTint: "bg-info/10",
  },
  {
    name: "₹100 Darshan",
    waiting: 280,
    max: 500,
    wait: 28,
    vols: 4,
    status: "ACTIVE",
    bgTint: "bg-emerald/10",
  },
  {
    name: "VIP Darshan",
    waiting: 34,
    max: 100,
    wait: 8,
    vols: 2,
    status: "ACTIVE",
    bgTint: "bg-gold/10",
  },

];

export function DashboardSection({ temple }: { temple: Temple }) {
  const inside = useJitter(12450, 80);
  const wait = useJitter(45, 3);
  const parking = useJitter(78, 2);
  const now = useLiveClock();
  const pct = Math.round((inside / 20000) * 100);

  const [footfallFilter, setFootfallFilter] = useState<"all" | "morning" | "evening">("all");
  const [selectedQueueLane, setSelectedQueueLane] = useState<string>("all");

  const filteredFootfall = footfallAllData.filter((_, idx) => {
    if (footfallFilter === "morning") return idx <= 7; // 5 AM - 12 PM
    if (footfallFilter === "evening") return idx >= 7; // 12 PM - 9 PM
    return true;
  });
  return (
    <div className="space-y-5">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-[#1A1F60] via-[#252A7C] to-[#1A1F60] p-6 md:p-8 text-white shadow-[0_12px_40px_rgba(0,0,0,0.25)]">
        {/* Decorative shapes */}
        <div className="absolute top-0 right-0 -mt-20 -mr-20 h-64 w-64 rounded-full bg-white/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 -mb-20 h-40 w-40 rounded-full bg-saffron/10 blur-2xl pointer-events-none" />

        <div className="grid gap-6 lg:grid-cols-[1fr_auto_1fr] items-center relative z-10">
          {/* Left Column */}
          <div className="flex flex-col items-start gap-4">
            <div>
              <div className="text-2xl md:text-3xl font-extrabold tracking-tight drop-shadow-md">
                {temple.name}
              </div>
              <div className="text-[12px] text-indigo-200 mt-1 font-bold tracking-wide">
                Crowd Intelligence Dashboard
              </div>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald/10 backdrop-blur-md px-3 py-1 text-[9px] font-bold tracking-widest text-emerald border border-emerald/20 shadow-sm mt-1">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
              </span>
              LIVE <span className="opacity-80 font-medium tracking-normal">· Updated {now.toLocaleTimeString("en-IN", { hour12: false })}</span>
            </div>
          </div>

          {/* Middle Column */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 px-4 lg:px-8 border-y lg:border-y-0 lg:border-x border-white/10 py-6 lg:py-0">
            <div className="relative h-[105px] w-[105px] shrink-0 drop-shadow-md">
              <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" stroke="rgba(255,255,255,0.1)" strokeWidth="10" fill="none" />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  stroke="#f97316"
                  strokeWidth="10"
                  fill="none"
                  strokeDasharray="263.89"
                  strokeDashoffset={263.89 - (263.89 * pct) / 100}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-in-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center pt-1">
                <span className="text-[22px] font-extrabold text-white leading-none">{pct}%</span>
                <span className="text-[8px] font-bold tracking-widest text-indigo-200 mt-1 uppercase">Capacity</span>
              </div>
            </div>

            <div className="text-center sm:text-left">
              <div className="text-4xl font-extrabold tabular-nums text-white tracking-tight drop-shadow-md">
                {inside.toLocaleString("en-IN")}
              </div>
              <div className="text-[11px] text-indigo-200 mt-1 font-bold tracking-wide">
                Devotees currently inside
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="flex flex-col justify-center">
            {[
              { label: "Today's total Devotees", value: "76,480" },
              { label: "Peak (10:30 AM)", value: "31,640" },
              { label: "Darshan Flow Rate", value: "2,500 / hr" },
              { label: "Next Peak (5:00 PM - 6:30 PM)", value: "18,500 Expected" },
            ].map((stat, i) => (
              <div
                key={stat.label}
                className={`flex justify-between items-center py-2.5 gap-4 ${i !== 3 ? "border-b border-white/10" : ""
                  }`}
              >
                <span className="text-[12px] font-medium text-indigo-200 tracking-wide">
                  {stat.label}
                </span>
                <span className="font-bold tabular-nums text-white text-sm whitespace-nowrap text-right">
                  {stat.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* KPI Row */}
      <div className="grid grid-cols-2 gap-6 md:grid-cols-5">
        <StatCard
          icon={Clock}
          label="Current Queue Wait"
          value={wait}
          valueSuffix="mins"
          sub={`Common Darshan · ${wait > 50 ? 'High' : wait > 30 ? 'Moderate' : 'Low'} load`}
          color="text-foreground"
          trend={{ up: wait > 45, text: wait > 45 ? "+surge" : "Normal" }}
          bgTint="bg-saffron/10 text-saffron border border-saffron/20"
          progress={Math.min(100, Math.round((wait / 90) * 100))}
        />
        <StatCard
          icon={Users}
          label="Crowd Capacity"
          value={pct}
          valueSuffix="%"
          sub={`${inside.toLocaleString("en-IN")} inside · Max 20k`}
          color="text-status-busy"
          bgTint="bg-status-busy/10 text-status-busy border border-status-busy/20"
          progress={pct}
          trend={{ up: pct > 80, text: pct > 80 ? "Near full" : "Stable" }}
        />
        <StatCard
          icon={Activity}
          label="Volunteers On Duty"
          value="48 / 60"
          sub="12 on break · 0 absent"
          color="text-info"
          bgTint="bg-info/10 text-info border border-info/20"
          progress={80}
          trend={{ up: true, text: "80% staffed" }}
        />
        <StatCard
          icon={Car}
          label="Parking Occupancy"
          value={parking}
          valueSuffix="%"
          sub={`${Math.round(parking * 15)} slots used · ${Math.round((100 - parking) * 15)} free`}
          color="text-status-busy"
          bgTint="bg-gold/10 text-gold border border-gold/20"
          progress={parking}
          trend={{ up: parking > 85, text: parking > 85 ? "Near full" : "Available" }}
        />
        <StatCard
          icon={Gauge}
          label="Congestion Level"
          value="BUSY"
          sub="Since 9:15 AM · Improving"
          color="text-status-crowded"
          bgTint="bg-status-crowded/10 text-status-crowded border border-status-crowded/20"
          progress={72}
          trend={{ up: false, text: "72% density" }}
        />
      </div>
      {/* AI Smart Suggestions - Card View */}
      <div>
        <div className="mb-4 flex items-center gap-2 text-xl font-black tracking-tight text-foreground drop-shadow-sm">
          🤖 AI Smart Suggestions
          <span className="ml-2 text-sm font-bold text-muted-foreground/80 tracking-normal drop-shadow-none">
            Based on current crowd patterns
          </span>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {suggestions.map((s) => {
            let kindColor = "text-muted-foreground bg-muted border-border";
            const btnColor = "bg-[#1A1F60] hover:bg-[#252A7C] text-white shadow-[0_4px_12px_rgba(26,31,96,0.25)]";

            if (s.kind === "URGENT") kindColor = "text-danger bg-danger/10 border-danger/20";
            if (s.kind === "WARNING") kindColor = "text-saffron bg-saffron/10 border-saffron/20";
            if (s.kind === "INFO") kindColor = "text-info bg-info/10 border-info/20";
            if (s.kind === "SUCCESS") kindColor = "text-emerald bg-emerald/10 border-emerald/20";

            return (
              <div
                key={s.title}
                className={`group flex flex-col justify-between rounded-xl bg-white/60 backdrop-blur-xl p-6 border border-border/50 shadow-sm transition-all duration-500 hover:shadow-xl hover:-translate-y-1 relative overflow-hidden`}
              >
                <div>
                  <div className={`inline-flex items-center px-2.5 py-1 mb-3 rounded-full text-[9px] font-black tracking-widest border ${kindColor}`}>
                    {s.kind}
                  </div>
                  <div className="text-[13px] font-black tracking-tight text-foreground/90">{s.title}</div>
                  <div className="mt-1.5 text-[11px] text-muted-foreground font-semibold leading-relaxed">{s.body}</div>
                </div>
                <div className="mt-5 flex gap-2">
                  <button
                    onClick={() => toast.success("Notifications sent")}
                    className={`flex-1 rounded-xl py-2 text-[11px] font-extrabold transition-all hover:-translate-y-0.5 hover:shadow-md ${btnColor}`}
                  >
                    Execute
                  </button>
                  <button className="flex-1 rounded-xl bg-surface border border-border/60 py-2 text-[11px] font-bold text-foreground shadow-sm transition-all hover:bg-muted hover:-translate-y-0.5">
                    Dismiss
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {/* Main Dashboard Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Hourly Footfall Chart */}
        <div className="rounded-2xl bg-white/70 backdrop-blur-xl p-6 sm:p-7 border border-border/60 shadow-sm transition-all duration-500 hover:shadow-xl hover:-translate-y-0.5">
          {/* Header */}
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20">
                  <Activity size={15} />
                </div>
                <h3 className="text-[15px] font-extrabold tracking-tight text-foreground">
                  Today's Hourly Footfall
                </h3>
              </div>
              <p className="mt-1 text-xs font-medium text-muted-foreground">
                Recorded actuals (5 AM – 2 PM) & AI projected rush (3 PM – 9 PM)
              </p>
            </div>

            {/* Filter buttons */}
            <div className="flex items-center gap-1.5 self-start rounded-xl bg-muted/70 p-1 border border-border/50">
              <button
                onClick={() => setFootfallFilter("all")}
                className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all ${
                  footfallFilter === "all"
                    ? "bg-white text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                All Day
              </button>
              <button
                onClick={() => setFootfallFilter("morning")}
                className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all ${
                  footfallFilter === "morning"
                    ? "bg-white text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Morning
              </button>
              <button
                onClick={() => setFootfallFilter("evening")}
                className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all ${
                  footfallFilter === "evening"
                    ? "bg-white text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Evening
              </button>
            </div>
          </div>

          {/* Key Stat Badges Strip */}
          <div className="mb-5 grid grid-cols-3 gap-2.5 rounded-xl bg-secondary-tint/40 p-2.5 border border-secondary-tint">
            <div className="text-center sm:text-left sm:px-2">
              <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Current Rate</div>
              <div className="text-sm font-black text-foreground flex items-center justify-center sm:justify-start gap-1 mt-0.5">
                <span className="h-1.5 w-1.5 rounded-full bg-status-normal animate-pulse" />
                12,450 <span className="text-[10px] font-semibold text-muted-foreground">/hr</span>
              </div>
            </div>
            <div className="text-center sm:text-left sm:px-2 border-x border-border/50">
              <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Day Peak</div>
              <div className="text-sm font-black text-primary mt-0.5">
                16.4k <span className="text-[10px] font-semibold text-muted-foreground">(6 PM)</span>
              </div>
            </div>
            <div className="text-center sm:text-left sm:px-2">
              <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Devotees Today</div>
              <div className="text-sm font-black text-[#1A1F60] mt-0.5">
                76,480
              </div>
            </div>
          </div>

          {/* Chart */}
          <div className="h-[290px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={filteredFootfall} margin={{ top: 12, right: 12, left: -16, bottom: 0 }}>
                <defs>
                  {/* Actual recorded gradient */}
                  <linearGradient id="footfallActualGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#E22E28" stopOpacity={0.4} />
                    <stop offset="60%" stopColor="#E22E28" stopOpacity={0.12} />
                    <stop offset="100%" stopColor="#E22E28" stopOpacity={0.0} />
                  </linearGradient>
                  {/* Forecast projected gradient */}
                  <linearGradient id="footfallForecastGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#818CF8" stopOpacity={0.35} />
                    <stop offset="70%" stopColor="#818CF8" stopOpacity={0.08} />
                    <stop offset="100%" stopColor="#818CF8" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="4 4"
                  stroke="var(--border)"
                  opacity={0.6}
                  vertical={false}
                />
                <XAxis
                  dataKey="t"
                  stroke="var(--muted-foreground)"
                  fontSize={11}
                  fontWeight={600}
                  tickLine={false}
                  axisLine={false}
                  dy={10}
                />
                <YAxis
                  stroke="var(--muted-foreground)"
                  fontSize={11}
                  fontWeight={600}
                  tickLine={false}
                  axisLine={false}
                  dx={-8}
                  tickFormatter={(v) => (v >= 1000 ? `${v / 1000}k` : v)}
                />
                <Tooltip content={<CustomFootfallTooltip />} />

                {/* Vertical reference line for live hour */}
                <ReferenceLine
                  x="2 PM"
                  stroke="#E22E28"
                  strokeDasharray="3 3"
                  strokeWidth={2}
                  label={{
                    value: "LIVE",
                    position: "top",
                    fill: "#E22E28",
                    fontSize: 10,
                    fontWeight: 900,
                  }}
                />

                {/* Recorded actual footfall */}
                <Area
                  type="monotone"
                  dataKey="actual"
                  name="Recorded Actual"
                  stroke="#E22E28"
                  strokeWidth={3}
                  fill="url(#footfallActualGradient)"
                  activeDot={{ r: 6, fill: "#E22E28", stroke: "#FFFFFF", strokeWidth: 2 }}
                />

                {/* AI Forecast footfall */}
                <Area
                  type="monotone"
                  dataKey="forecast"
                  name="AI Projected"
                  stroke="#818CF8"
                  strokeDasharray="5 5"
                  strokeWidth={2.5}
                  fill="url(#footfallForecastGradient)"
                  activeDot={{ r: 6, fill: "#818CF8", stroke: "#FFFFFF", strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Custom Footer Legend */}
          <div className="mt-4 flex flex-wrap items-center justify-between border-t border-border/40 pt-3 text-xs">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 font-bold text-foreground/80">
                <span className="h-2.5 w-5 rounded-full bg-[#E22E28]" />
                <span>Recorded Actuals</span>
              </div>
              <div className="flex items-center gap-1.5 font-bold text-indigo-500">
                <span className="h-0.5 w-5 border-b-2 border-dashed border-indigo-400" />
                <span>AI Prediction</span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-bold text-emerald">
              <Sparkles size={13} />
              <span>96.4% Model Confidence</span>
            </div>
          </div>
        </div>

        {/* Queue Wait Time Chart */}
        <div className="rounded-2xl bg-white/70 backdrop-blur-xl p-6 sm:p-7 border border-border/60 shadow-sm transition-all duration-500 hover:shadow-xl hover:-translate-y-0.5">
          {/* Header */}
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-secondary/10 text-secondary border border-secondary/20">
                  <Clock size={15} />
                </div>
                <h3 className="text-[15px] font-extrabold tracking-tight text-foreground">
                  Queue Wait Time Trend
                </h3>
              </div>
              <p className="mt-1 text-xs font-medium text-muted-foreground">
                6-hour telemetry across 4 queue lines (9:00 AM – 2:30 PM)
              </p>
            </div>

            <div className="flex items-center gap-2 self-start">
              <span className="rounded-full bg-secondary/10 px-3 py-1 text-[10px] font-black tracking-wide text-secondary border border-secondary/20">
                Avg: 34 mins
              </span>
            </div>
          </div>

          {/* Interactive Lane Toggle Pills with Live Wait Times */}
          <div className="mb-5 flex flex-wrap gap-2">
            {[
              { id: "all", label: "All Lanes", color: "#64748B", wait: null },
              { id: "common", label: "Common", color: "#E22E28", wait: "52m" },
              { id: "special20", label: "₹20 Ticket", color: "#3B82F6", wait: "46m" },
              { id: "quick100", label: "₹100 Ticket", color: "#10B981", wait: "28m" },
              { id: "vip", label: "VIP", color: "#F59E0B", wait: "8m" },
            ].map((lane) => {
              const isSelected = selectedQueueLane === lane.id;
              return (
                <button
                  key={lane.id}
                  onClick={() => setSelectedQueueLane(lane.id)}
                  className={`flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-bold transition-all border ${
                    isSelected
                      ? "bg-foreground text-background border-foreground shadow-sm scale-102"
                      : "bg-white/80 hover:bg-muted text-muted-foreground border-border/70"
                  }`}
                >
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: lane.color }}
                  />
                  <span>{lane.label}</span>
                  {lane.wait && (
                    <span
                      className={`ml-0.5 rounded px-1.5 py-0.2 text-[10px] font-extrabold ${
                        isSelected ? "bg-white/20 text-white" : "bg-muted text-foreground"
                      }`}
                    >
                      {lane.wait}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Chart */}
          <div className="h-[290px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={queueTrendData} margin={{ top: 12, right: 12, left: -16, bottom: 0 }}>
                <CartesianGrid
                  strokeDasharray="4 4"
                  stroke="var(--border)"
                  opacity={0.6}
                  vertical={false}
                />
                <XAxis
                  dataKey="t"
                  stroke="var(--muted-foreground)"
                  fontSize={11}
                  fontWeight={600}
                  tickLine={false}
                  axisLine={false}
                  dy={10}
                />
                <YAxis
                  stroke="var(--muted-foreground)"
                  fontSize={11}
                  fontWeight={600}
                  tickLine={false}
                  axisLine={false}
                  dx={-8}
                  tickFormatter={(v) => `${v}m`}
                />
                <Tooltip content={<CustomQueueTooltip />} />

                {/* Congestion Alert Threshold line */}
                <ReferenceLine
                  y={45}
                  stroke="#E22E28"
                  strokeDasharray="3 3"
                  strokeOpacity={0.7}
                  label={{
                    value: "Crowd Warning Threshold (45m)",
                    position: "insideTopRight",
                    fill: "#E22E28",
                    fontSize: 10,
                    fontWeight: 800,
                  }}
                />

                {/* Common Darshan */}
                {(selectedQueueLane === "all" || selectedQueueLane === "common") && (
                  <Line
                    type="monotone"
                    dataKey="common"
                    name="Common Darshan"
                    stroke="#E22E28"
                    strokeWidth={selectedQueueLane === "common" ? 4 : 3}
                    dot={false}
                    activeDot={{ r: 6, fill: "#E22E28", stroke: "#FFFFFF", strokeWidth: 2 }}
                  />
                )}

                {/* ₹20 Darshan */}
                {(selectedQueueLane === "all" || selectedQueueLane === "special20") && (
                  <Line
                    type="monotone"
                    dataKey="special20"
                    name="₹20 Darshan"
                    stroke="#3B82F6"
                    strokeWidth={selectedQueueLane === "special20" ? 4 : 3}
                    dot={false}
                    activeDot={{ r: 6, fill: "#3B82F6", stroke: "#FFFFFF", strokeWidth: 2 }}
                  />
                )}

                {/* ₹100 Darshan */}
                {(selectedQueueLane === "all" || selectedQueueLane === "quick100") && (
                  <Line
                    type="monotone"
                    dataKey="quick100"
                    name="₹100 Darshan"
                    stroke="#10B981"
                    strokeWidth={selectedQueueLane === "quick100" ? 4 : 3}
                    dot={false}
                    activeDot={{ r: 6, fill: "#10B981", stroke: "#FFFFFF", strokeWidth: 2 }}
                  />
                )}

                {/* VIP Darshan */}
                {(selectedQueueLane === "all" || selectedQueueLane === "vip") && (
                  <Line
                    type="monotone"
                    dataKey="vip"
                    name="VIP Darshan"
                    stroke="#F59E0B"
                    strokeWidth={selectedQueueLane === "vip" ? 4 : 3}
                    dot={false}
                    activeDot={{ r: 6, fill: "#F59E0B", stroke: "#FFFFFF", strokeWidth: 2 }}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Footer note */}
          <div className="mt-4 flex flex-wrap items-center justify-between border-t border-border/40 pt-3 text-xs text-muted-foreground">
            <span className="font-semibold">
              Devotee wait duration is calculated using gate entry sensors & CCTV telemetry.
            </span>
            <span className="font-bold text-[#E22E28]">
              Common queue is +7m over threshold
            </span>
          </div>
        </div>
      </div>

      {/* --- QUEUE MANAGEMENT --- */}
      <div className="mt-10 pt-10 border-t border-border/50 space-y-6">
        <div className="flex items-center gap-2.5 text-[14px] font-black tracking-tight text-foreground drop-shadow-sm">
          <Timer size={18} className="text-primary" /> Live Queue Management
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {lanes.map((l) => {
            const pct = l.waiting / l.max;
            return (
              <div
                key={l.name}
                className={`group flex flex-col justify-between p-6 bg-white/60 backdrop-blur-xl border border-border/50 shadow-sm rounded-xl transition-all duration-500 hover:shadow-xl hover:-translate-y-1 relative overflow-hidden`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="font-bold text-[13px] tracking-tight text-foreground/90 leading-tight w-2/3">{l.name}</div>
                  <span
                    className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-[8px] font-bold tracking-widest border ${l.status === "ACTIVE"
                      ? "bg-emerald/10 text-emerald border-emerald/20"
                      : "bg-status-busy/10 text-status-busy border-status-busy/20"
                      }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${l.status === "ACTIVE" ? "bg-emerald animate-pulse" : "bg-status-busy"}`}
                    />
                    {l.status}
                  </span>
                </div>

                <div className="mt-4 flex items-end gap-2">
                  <span className="text-2xl font-montserrat font-extrabold tabular-nums leading-none text-foreground tracking-tighter">
                    {l.waiting}
                  </span>
                  <span className="text-[10px] font-medium text-muted-foreground mb-0.5">
                    / {l.max} inside
                  </span>
                </div>

                <div className="mt-3 flex items-center gap-3">
                  <div className="h-1.5 flex-1 rounded-full bg-black/5 dark:bg-white/5 overflow-hidden">
                    <div className={`h-full ${l.status === "ACTIVE" ? "bg-primary" : "bg-status-busy"}`} style={{ width: `${pct * 100}%` }} />
                  </div>
                  <span className="text-[10px] font-semibold text-muted-foreground w-8 text-right">
                    {Math.round(pct * 100)}%
                  </span>
                </div>

                <div className="mt-5 pt-4 border-t border-border/40 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-widest mb-1">Wait Time</span>
                    <div className="flex items-baseline gap-1 text-danger">
                      <span className="text-[18px] font-extrabold tracking-tighter leading-none">{l.wait}</span>
                      <span className="text-[10px] font-semibold">mins</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-widest mb-1">Staffing</span>
                    <span className="text-[11px] font-bold text-foreground">{l.vols} <span className="text-muted-foreground/80 font-medium">vols</span></span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_280px_280px]">
          {/* AI Optimization */}
          <div className="rounded-xl border border-saffron/30 bg-gradient-to-b from-saffron/10 to-white/40 backdrop-blur-xl flex flex-col justify-center shadow-sm transition-all duration-500 hover:shadow-xl hover:-translate-y-1 overflow-hidden">
            <div className="flex items-center gap-2 border-b border-saffron/20 bg-saffron/10 px-6 py-4">
              <AlertOctagon size={18} className="text-saffron animate-pulse" />
              <div className="text-[13px] font-black tracking-widest uppercase text-saffron drop-shadow-sm">AI Optimization Recommended</div>
            </div>
            <div className="p-6">
              <div className="text-sm font-bold text-foreground">Open Special Darshan Lane</div>
              <div className="mt-2 text-xs text-muted-foreground leading-relaxed">
                Main queues are approaching 80% saturation. Projected wait times will exceed safety
                thresholds (75 mins) in approximately 22 minutes.
              </div>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => toast.success("Special Darshan Lane Opened.")}
                  className="flex-1 rounded-lg bg-saffron py-2 text-xs font-bold text-white shadow-sm hover:bg-saffron/90 transition-all hover:-translate-y-0.5"
                >
                  Execute
                </button>
                <button className="flex-1 rounded-lg border border-border bg-surface py-2 text-xs font-bold text-foreground transition-all hover:bg-muted hover:-translate-y-0.5">
                  Dismiss
                </button>
              </div>
            </div>
          </div>

          {/* Queue Actions */}
          <div className="rounded-xl bg-white/60 backdrop-blur-xl p-8 border border-border/50 shadow-sm transition-all duration-500 hover:shadow-xl hover:-translate-y-1">
            <div className="mb-5 text-[13px] font-extrabold tracking-tight text-foreground">Queue Actions</div>
            <div className="grid gap-2 text-[11px]">
              {[
                { i: Plus, l: "Open New Lane" },
                { i: Pause, l: "Pause Intake" },
                { i: Megaphone, l: "Announce Wait" },
                { i: Merge, l: "Merge Common & ₹20" },
                { i: Siren, l: "Emergency Clear" },
              ].map(({ i: Icon, l }) => (
                <button
                  key={l}
                  onClick={() => toast(`${l} triggered`)}
                  className="flex items-center gap-3 rounded-lg border border-border bg-surface px-3 py-2 text-left font-semibold text-foreground hover:bg-muted transition-colors"
                >
                  <Icon size={14} className="text-muted-foreground" /> {l}
                </button>
              ))}
            </div>
          </div>

          {/* Queue Config */}
          <div className="rounded-xl bg-white/60 backdrop-blur-xl p-8 flex flex-col justify-between border border-border/50 shadow-sm transition-all duration-500 hover:shadow-xl hover:-translate-y-1">
            <div>
              <div className="mb-5 text-[13px] font-extrabold tracking-tight text-foreground">Queue Config</div>
              <div className="space-y-6 text-[11px]">
                <div>
                  <div className="mb-1 flex justify-between">
                    <span className="font-semibold text-muted-foreground">Max intake rate</span>
                    <span className="font-mono font-bold">{Math.round(inside / 100)} ppl/m</span>
                  </div>
                  <input
                    type="range"
                    min={50}
                    max={400}
                    defaultValue={200}
                    className="w-full accent-primary cursor-pointer"
                  />
                </div>
                <div>
                  <div className="mb-1 flex justify-between">
                    <span className="font-semibold text-muted-foreground">Target wait time</span>
                    <span className="font-mono font-bold">45 mins</span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={120}
                    defaultValue={45}
                    className="w-full accent-primary cursor-pointer"
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-border pt-4 mt-4">
              <span className="text-xs font-bold text-foreground">Auto-balance</span>
              <span className="rounded-lg bg-emerald/15 px-3 py-1 font-bold text-[10px] text-emerald border border-emerald/20 shadow-sm">
                ● ON
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} // Suppress unused void Users; void Clock; void Car; void Gauge;
