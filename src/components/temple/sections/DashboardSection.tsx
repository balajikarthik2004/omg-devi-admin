import { useState } from "react";
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

type DashboardTooltipProps<Datum> = {
  active?: boolean;
  payload?: readonly { payload: Datum }[];
  label?: string | number;
};

function CustomFootfallTooltip({
  active,
  payload,
  label,
}: DashboardTooltipProps<(typeof footfallAllData)[number]>) {
  if (!active || !payload || !payload.length) return null;
  const data = payload[0]?.payload;
  const isForecast = data?.actual === null && data?.forecast !== null;
  const isCurrent = data?.isCurrent;
  const val = data?.actual ?? data?.forecast ?? 0;

  return (
    <div className="rounded-xl border border-border bg-popover p-3.5 text-popover-foreground shadow-lg min-w-[210px]">
      <div className="flex items-center justify-between pb-2 border-b border-border">
        <div className="flex items-center gap-1.5 font-bold text-xs text-foreground">
          <Clock size={13} className="text-primary" />
          <span>{label}</span>
        </div>
        <span
          className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider ${
            isCurrent
              ? "border border-primary/20 bg-primary/10 text-primary"
              : isForecast
                ? "border border-info/20 bg-info/10 text-info"
                : "border border-emerald/20 bg-emerald/10 text-emerald"
          }`}
        >
          {isCurrent ? "● Live Now" : isForecast ? "AI Forecast" : "Recorded"}
        </span>
      </div>

      <div className="pt-2.5">
        <div className="text-[11px] font-medium text-muted-foreground">Devotee Inflow Rate</div>
        <div className="flex items-baseline gap-1.5 mt-0.5">
          <span className="text-2xl font-bold tracking-tight text-foreground">
            {val.toLocaleString()}
          </span>
          <span className="text-[11px] font-semibold text-muted-foreground">devotees/hr</span>
        </div>
      </div>

      {data?.isPeak && (
        <div className="mt-2.5 flex items-center gap-1.5 text-[10px] font-bold border border-gold/30 bg-gold/10 text-saffron px-2 py-1 rounded-md">
          <TrendingUp size={12} className="text-saffron" /> Projected Peak Hour of the Day
        </div>
      )}
    </div>
  );
}

function CustomQueueTooltip({
  active,
  payload,
  label,
}: DashboardTooltipProps<(typeof queueTrendData)[number]>) {
  if (!active || !payload || !payload.length) return null;
  const data = payload[0]?.payload;

  return (
    <div className="rounded-xl border border-border bg-popover p-3.5 text-popover-foreground shadow-lg min-w-[220px]">
      <div className="flex items-center justify-between pb-2 border-b border-border">
        <div className="flex items-center gap-1.5 font-bold text-xs text-foreground">
          <Timer size={13} className="text-info" />
          <span>{label}</span>
        </div>
        {data?.isLive ? (
          <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold border border-primary/20 bg-primary/10 text-primary">
            ● Current
          </span>
        ) : (
          <span className="text-[10px] font-semibold text-muted-foreground">Recorded</span>
        )}
      </div>

      <div className="space-y-1.5 pt-2.5">
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1.5 text-foreground font-medium">
            <span className="h-2 w-2 rounded-full bg-destructive" /> Common Darshan
          </span>
          <span
            className={`font-bold ${(data?.common ?? 0) >= 45 ? "text-destructive" : "text-foreground"}`}
          >
            {data?.common} mins
          </span>
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1.5 text-foreground font-medium">
            <span className="h-2 w-2 rounded-full bg-info" /> ₹20 Darshan
          </span>
          <span className="font-bold text-foreground">{data?.special20} mins</span>
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1.5 text-foreground font-medium">
            <span className="h-2 w-2 rounded-full bg-emerald" /> ₹100 Darshan
          </span>
          <span className="font-bold text-foreground">{data?.quick100} mins</span>
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1.5 text-foreground font-medium">
            <span className="h-2 w-2 rounded-full bg-saffron" /> VIP Darshan
          </span>
          <span className="font-bold text-foreground">{data?.vip} mins</span>
        </div>
      </div>

      <div className="mt-2.5 pt-2 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground">
        <span>Average Wait</span>
        <span className="font-extrabold text-foreground">{data?.avg} mins</span>
      </div>
    </div>
  );
}
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
    <div className="@container space-y-6 font-body">
      {/* Hero Banner */}
      <div className="temple-dashboard-hero rounded-2xl border border-primary bg-primary p-5 text-primary-foreground sm:p-7">
        <div className="grid items-center gap-5 @min-[58rem]:grid-cols-[1fr_auto_1fr]">
          {/* Left Column */}
          <div className="flex flex-col items-start gap-4">
            <div>
              <h2 className="font-display text-2xl font-bold leading-tight tracking-tight sm:text-3xl">
                {temple.name}
              </h2>
              <p className="mt-1 text-sm font-medium text-sidebar-muted">
                Crowd Intelligence Dashboard
              </p>
            </div>
            <div className="inline-flex flex-wrap items-center gap-x-2 gap-y-1 rounded-full border border-primary-foreground/20 bg-primary-foreground/10 px-3 py-1 text-xs font-semibold">
              <span aria-hidden="true" className="size-1.5 rounded-full bg-gold" />
              Live{" "}
              <span className="font-medium tabular-nums text-sidebar-muted">
                · Updated {now.toLocaleTimeString("en-IN", { hour12: false })}
              </span>
            </div>
          </div>

          {/* Middle Column */}
          <div className="flex items-center gap-4 border-y border-primary-foreground/15 py-4 @min-[58rem]:border-x @min-[58rem]:border-y-0 @min-[58rem]:px-5">
            <div className="relative size-20 shrink-0 sm:size-24">
              <svg aria-hidden="true" className="size-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  stroke="var(--primary-foreground)"
                  strokeOpacity={0.15}
                  strokeWidth="8"
                  fill="none"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  stroke="var(--gold)"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray="263.89"
                  strokeDashoffset={263.89 - (263.89 * pct) / 100}
                  strokeLinecap="round"
                  className="motion-safe:transition-[stroke-dashoffset] motion-safe:duration-500"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center pt-1">
                <span className="text-lg font-bold leading-none tabular-nums">{pct}%</span>
                <span className="mt-1 text-[10px] font-medium text-sidebar-muted">Capacity</span>
              </div>
            </div>

            <div>
              <div className="font-numeric text-3xl font-bold tracking-tight tabular-nums sm:text-4xl">
                {inside.toLocaleString("en-IN")}
              </div>
              <div className="mt-1 text-xs font-medium text-sidebar-muted">
                Devotees currently inside
              </div>
            </div>
          </div>

          {/* Right Column */}
          <dl className="divide-y divide-primary-foreground/15">
            {[
              { label: "Today's total devotees", value: "76,480" },
              { label: "Peak (10:30 AM)", value: "31,640" },
              { label: "Darshan flow rate", value: "2,500 / hr" },
              { label: "Next peak (5:00–6:30 PM)", value: "18,500 expected" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="flex items-baseline justify-between gap-3 py-2 first:pt-0 last:pb-0"
              >
                <dt className="text-xs font-medium text-sidebar-muted">{stat.label}</dt>
                <dd className="text-right text-xs font-bold tabular-nums sm:text-sm">
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
      {/* KPI Row */}
      <div className="grid grid-cols-2 gap-3 @min-[34rem]:grid-cols-3 @min-[58rem]:grid-cols-5 @max-[34rem]:[&>*:last-child]:col-span-2">
        <StatCard
          icon={Clock}
          label="Current Queue Wait"
          value={wait}
          valueSuffix="mins"
          sub={`Common Darshan · ${wait > 50 ? "High" : wait > 30 ? "Moderate" : "Low"} load`}
          color="text-foreground"
          status={{ warning: wait > 45, text: wait > 45 ? "Surge" : "Normal" }}
          bgTint="bg-saffron/10 text-saffron border border-saffron/20"
          barGradient="var(--saffron)"
          progress={Math.min(100, Math.round((wait / 90) * 100))}
        />
        <StatCard
          icon={Users}
          label="Crowd Capacity"
          value={pct}
          valueSuffix="%"
          sub={`${inside.toLocaleString("en-IN")} inside · Max 20k`}
          color="text-status-busy"
          bgTint="bg-gold/10 text-saffron border border-status-busy/20"
          barGradient="var(--gold)"
          progress={pct}
          status={{ warning: pct > 80, text: pct > 80 ? "Near full" : "Stable" }}
        />
        <StatCard
          icon={Activity}
          label="Volunteers On Duty"
          value="48 / 60"
          sub="12 on break · 0 absent"
          color="text-info"
          bgTint="bg-info/10 text-info border border-info/20"
          barGradient="var(--info)"
          progress={80}
          status={{ text: "80% staffed" }}
        />
        <StatCard
          icon={Car}
          label="Parking Occupancy"
          value={parking}
          valueSuffix="%"
          sub={`${Math.round(parking * 15)} slots used · ${Math.round((100 - parking) * 15)} free`}
          color="text-status-busy"
          bgTint="bg-gold/10 text-saffron border border-gold/20"
          barGradient="var(--gold)"
          progress={parking}
          status={{ warning: parking > 85, text: parking > 85 ? "Near full" : "Available" }}
        />
        <StatCard
          icon={Gauge}
          label="Congestion Level"
          value="BUSY"
          sub="Since 9:15 AM · Improving"
          color="text-status-crowded"
          bgTint="bg-status-crowded/10 text-destructive border border-status-crowded/20"
          barGradient="var(--destructive)"
          progress={72}
          status={{ warning: true, text: "72% density" }}
        />
      </div>
      {/* AI Smart Suggestions - Card View */}
      <div>
        <h2 className="mb-3 flex items-center gap-2 font-display text-lg font-bold tracking-tight">
          <Sparkles size={18} className="text-saffron" aria-hidden="true" /> AI Smart Suggestions
        </h2>
        <div className="grid gap-4 @min-[30rem]:grid-cols-2 @min-[58rem]:grid-cols-4">
          {suggestions.map((s) => {
            let kindColor = "text-muted-foreground bg-muted border-border";
            if (s.kind === "URGENT") kindColor = "text-destructive bg-danger/10 border-danger/20";
            if (s.kind === "WARNING") kindColor = "text-saffron bg-saffron/10 border-saffron/20";
            if (s.kind === "INFO") kindColor = "text-info bg-info/10 border-info/20";
            if (s.kind === "SUCCESS") kindColor = "text-emerald bg-emerald/10 border-emerald/20";

            return (
              <div key={s.title} className="temple-panel flex flex-col justify-between p-4 sm:p-5">
                <div>
                  <div
                    className={`mb-3 inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold tracking-wide ${kindColor}`}
                  >
                    {s.kind}
                  </div>
                  <h3 className="text-sm font-bold leading-snug">{s.title}</h3>
                  <p className="mt-1.5 text-xs font-medium leading-relaxed text-muted-foreground">
                    {s.body}
                  </p>
                </div>
                <div className="mt-5 flex gap-2">
                  <button
                    onClick={() => toast.success("Notifications sent")}
                    className="flex-1 rounded-lg bg-primary px-2 py-2 text-xs font-semibold text-primary-foreground transition-colors hover:bg-secondary"
                  >
                    Execute
                  </button>
                  <button className="flex-1 rounded-lg border border-border bg-surface px-2 py-2 text-xs font-semibold transition-colors hover:bg-muted">
                    Dismiss
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {/* Main Dashboard Content Grid */}
      <div className="grid gap-4 @min-[64rem]:grid-cols-2">
        {/* Hourly Footfall Chart */}
        <div className="temple-panel flex flex-col p-4 sm:p-5">
          {/* Header */}
          <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20">
                  <Activity size={15} />
                </div>
                <h2 className="font-display text-base font-bold tracking-tight text-foreground">
                  Today's Hourly Footfall
                </h2>
              </div>
              <p className="mt-1 text-xs font-medium text-muted-foreground">
                Recorded actuals (5 AM – 2 PM) & AI projected rush (3 PM – 9 PM)
              </p>
            </div>

            {/* Filter buttons */}
            <div
              role="group"
              aria-label="Footfall time range"
              className="flex flex-wrap items-center gap-1 self-start rounded-xl border border-border bg-muted p-1"
            >
              <button
                aria-pressed={footfallFilter === "all"}
                onClick={() => setFootfallFilter("all")}
                className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all ${
                  footfallFilter === "all"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                All Day
              </button>
              <button
                aria-pressed={footfallFilter === "morning"}
                onClick={() => setFootfallFilter("morning")}
                className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all ${
                  footfallFilter === "morning"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Morning
              </button>
              <button
                aria-pressed={footfallFilter === "evening"}
                onClick={() => setFootfallFilter("evening")}
                className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all ${
                  footfallFilter === "evening"
                    ? "bg-primary text-primary-foreground shadow-sm"
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
              <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Current Rate
              </div>
              <div className="text-sm font-bold text-foreground flex items-center justify-center sm:justify-start gap-1 mt-0.5">
                <span className="h-1.5 w-1.5 rounded-full bg-status-normal animate-pulse" />
                12,450 <span className="text-[10px] font-semibold text-muted-foreground">/hr</span>
              </div>
            </div>
            <div className="text-center sm:text-left sm:px-2 border-x border-border/50">
              <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Day Peak
              </div>
              <div className="text-sm font-bold text-primary mt-0.5">
                16.4k{" "}
                <span className="text-[10px] font-semibold text-muted-foreground">(6 PM)</span>
              </div>
            </div>
            <div className="text-center sm:text-left sm:px-2">
              <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Devotees Today
              </div>
              <div className="text-sm font-bold text-primary mt-0.5">76,480</div>
            </div>
          </div>

          {/* Chart */}
          <div className="mb-4 h-[290px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={filteredFootfall}
                margin={{ top: 12, right: 12, left: -16, bottom: 0 }}
              >
                <defs>
                  {/* Actual recorded gradient */}
                  <linearGradient id="footfallActualGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.4} />
                    <stop offset="60%" stopColor="var(--primary)" stopOpacity={0.12} />
                    <stop offset="100%" stopColor="var(--primary)" stopOpacity={0.0} />
                  </linearGradient>
                  {/* Forecast projected gradient */}
                  <linearGradient id="footfallForecastGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--info)" stopOpacity={0.35} />
                    <stop offset="70%" stopColor="var(--info)" stopOpacity={0.08} />
                    <stop offset="100%" stopColor="var(--info)" stopOpacity={0.0} />
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
                  stroke="var(--primary)"
                  strokeDasharray="3 3"
                  strokeWidth={2}
                  label={{
                    value: "LIVE",
                    position: "top",
                    fill: "var(--primary)",
                    fontSize: 10,
                    fontWeight: 900,
                  }}
                />

                {/* Recorded actual footfall */}
                <Area
                  type="monotone"
                  dataKey="actual"
                  name="Recorded Actual"
                  stroke="var(--primary)"
                  strokeWidth={3}
                  fill="url(#footfallActualGradient)"
                  activeDot={{
                    r: 6,
                    fill: "var(--primary)",
                    stroke: "var(--surface)",
                    strokeWidth: 2,
                  }}
                />

                {/* AI Forecast footfall */}
                <Area
                  type="monotone"
                  dataKey="forecast"
                  name="AI Projected"
                  stroke="var(--info)"
                  strokeDasharray="5 5"
                  strokeWidth={2.5}
                  fill="url(#footfallForecastGradient)"
                  activeDot={{
                    r: 6,
                    fill: "var(--info)",
                    stroke: "var(--surface)",
                    strokeWidth: 2,
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Custom Footer Legend */}
          <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-border/40 pt-3 text-xs">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              <div className="flex items-center gap-1.5 font-bold text-foreground/80">
                <span className="h-2.5 w-5 rounded-full bg-primary" />
                <span>Recorded Actuals</span>
              </div>
              <div className="flex items-center gap-1.5 font-bold text-info">
                <span className="h-0.5 w-5 border-b-2 border-dashed border-info" />
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
        <div className="temple-panel flex flex-col p-4 sm:p-5">
          {/* Header */}
          <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-secondary/10 text-secondary border border-secondary/20">
                  <Clock size={15} />
                </div>
                <h2 className="font-display text-base font-bold tracking-tight text-foreground">
                  Queue Wait Time Trend
                </h2>
              </div>
              <p className="mt-1 text-xs font-medium text-muted-foreground">
                6-hour telemetry across 4 queue lines (9:00 AM – 2:30 PM)
              </p>
            </div>

            <div className="flex items-center gap-2 self-start">
              <span className="rounded-full bg-secondary/10 px-3 py-1 text-[10px] font-bold tracking-wide text-secondary border border-secondary/20">
                Avg: 34 mins
              </span>
            </div>
          </div>

          {/* Interactive Lane Toggle Pills with Live Wait Times */}
          <div role="group" aria-label="Queue lane" className="mb-5 flex flex-wrap gap-2">
            {[
              { id: "all", label: "All Lanes", color: "var(--muted-foreground)", wait: null },
              { id: "common", label: "Common", color: "var(--destructive)", wait: "52m" },
              { id: "special20", label: "₹20 Ticket", color: "var(--info)", wait: "46m" },
              { id: "quick100", label: "₹100 Ticket", color: "var(--emerald)", wait: "28m" },
              { id: "vip", label: "VIP", color: "var(--saffron)", wait: "8m" },
            ].map((lane) => {
              const isSelected = selectedQueueLane === lane.id;
              return (
                <button
                  key={lane.id}
                  aria-pressed={isSelected}
                  onClick={() => setSelectedQueueLane(lane.id)}
                  className={`flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-bold transition-all border ${
                    isSelected
                      ? "border-primary/30 bg-secondary-tint text-primary"
                      : "border-border bg-surface text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: lane.color }} />
                  <span>{lane.label}</span>
                  {lane.wait && (
                    <span
                      className={`ml-0.5 rounded px-1.5 py-0.5 text-[10px] font-extrabold ${
                        isSelected ? "bg-primary/10 text-primary" : "bg-muted text-foreground"
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
          <div className="mb-4 h-[290px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={queueTrendData}
                margin={{ top: 12, right: 12, left: -16, bottom: 0 }}
              >
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
                  stroke="var(--destructive)"
                  strokeDasharray="3 3"
                  strokeOpacity={0.7}
                />

                {/* Common Darshan */}
                {(selectedQueueLane === "all" || selectedQueueLane === "common") && (
                  <Line
                    type="monotone"
                    dataKey="common"
                    name="Common Darshan"
                    stroke="var(--destructive)"
                    strokeWidth={selectedQueueLane === "common" ? 4 : 3}
                    dot={false}
                    activeDot={{
                      r: 6,
                      fill: "var(--destructive)",
                      stroke: "var(--surface)",
                      strokeWidth: 2,
                    }}
                  />
                )}

                {/* ₹20 Darshan */}
                {(selectedQueueLane === "all" || selectedQueueLane === "special20") && (
                  <Line
                    type="monotone"
                    dataKey="special20"
                    name="₹20 Darshan"
                    stroke="var(--info)"
                    strokeWidth={selectedQueueLane === "special20" ? 4 : 3}
                    dot={false}
                    activeDot={{
                      r: 6,
                      fill: "var(--info)",
                      stroke: "var(--surface)",
                      strokeWidth: 2,
                    }}
                  />
                )}

                {/* ₹100 Darshan */}
                {(selectedQueueLane === "all" || selectedQueueLane === "quick100") && (
                  <Line
                    type="monotone"
                    dataKey="quick100"
                    name="₹100 Darshan"
                    stroke="var(--emerald)"
                    strokeWidth={selectedQueueLane === "quick100" ? 4 : 3}
                    dot={false}
                    activeDot={{
                      r: 6,
                      fill: "var(--emerald)",
                      stroke: "var(--surface)",
                      strokeWidth: 2,
                    }}
                  />
                )}

                {/* VIP Darshan */}
                {(selectedQueueLane === "all" || selectedQueueLane === "vip") && (
                  <Line
                    type="monotone"
                    dataKey="vip"
                    name="VIP Darshan"
                    stroke="var(--saffron)"
                    strokeWidth={selectedQueueLane === "vip" ? 4 : 3}
                    dot={false}
                    activeDot={{
                      r: 6,
                      fill: "var(--saffron)",
                      stroke: "var(--surface)",
                      strokeWidth: 2,
                    }}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Footer note */}
          <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-border/40 pt-3 text-xs text-muted-foreground">
            <span className="font-semibold">
              Devotee wait duration is calculated using gate entry sensors & CCTV telemetry.
            </span>
            <span className="inline-flex items-center gap-1.5 font-bold text-destructive">
              <span
                aria-hidden="true"
                className="w-4 shrink-0 border-b-2 border-dashed border-destructive"
              />
              Common queue is 7 min over the 45 min threshold
            </span>
          </div>
        </div>
      </div>

      {/* --- QUEUE MANAGEMENT --- */}
      <div className="space-y-4 border-t border-border pt-5">
        <h2 className="flex items-center gap-2 font-display text-lg font-bold tracking-tight">
          <Timer size={18} className="text-primary" aria-hidden="true" /> Live Queue Management
        </h2>

        <div className="grid gap-4 @min-[30rem]:grid-cols-2 @min-[58rem]:grid-cols-4">
          {lanes.map((l) => {
            const pct = l.waiting / l.max;
            return (
              <div key={l.name} className="temple-panel flex flex-col justify-between p-4 sm:p-5">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-sm font-bold leading-tight">{l.name}</h3>
                  <span
                    className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold tracking-wide border ${
                      l.status === "ACTIVE"
                        ? "bg-emerald/10 text-emerald border-emerald/20"
                        : "bg-gold/10 text-saffron border-status-busy/20"
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
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full ${l.status === "ACTIVE" ? "bg-primary" : "bg-status-busy"}`}
                      style={{ width: `${pct * 100}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-semibold text-muted-foreground w-8 text-right">
                    {Math.round(pct * 100)}%
                  </span>
                </div>

                <div className="mt-5 pt-4 border-t border-border/40 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-widest mb-1">
                      Wait Time
                    </span>
                    <div
                      className={`flex items-baseline gap-1 tabular-nums ${l.wait >= 45 ? "text-destructive" : "text-foreground"}`}
                    >
                      <span className="text-[18px] font-extrabold tracking-tighter leading-none">
                        {l.wait}
                      </span>
                      <span className="text-[10px] font-semibold">mins</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-widest mb-1">
                      Staffing
                    </span>
                    <span className="text-[11px] font-bold text-foreground">
                      {l.vols} <span className="text-muted-foreground/80 font-medium">vols</span>
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid gap-4 @min-[36rem]:grid-cols-2 @min-[64rem]:grid-cols-[1.4fr_1fr_1fr]">
          {/* AI Optimization */}
          <div className="temple-panel overflow-hidden @min-[36rem]:col-span-2 @min-[64rem]:col-span-1">
            <div className="flex items-center gap-2 border-b border-saffron/20 bg-gold/10 px-5 py-3 text-saffron">
              <AlertOctagon size={18} className="shrink-0" aria-hidden="true" />
              <h3 className="text-sm font-bold">AI Optimization Recommended</h3>
            </div>
            <div className="p-4 sm:p-5">
              <div className="text-sm font-bold text-foreground">Open Special Darshan Lane</div>
              <div className="mt-2 text-xs text-muted-foreground leading-relaxed">
                Main queues are approaching 80% saturation. Projected wait times will exceed safety
                thresholds (75 mins) in approximately 22 minutes.
              </div>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => toast.success("Special Darshan Lane Opened.")}
                  className="flex-1 rounded-lg bg-saffron py-2 text-xs font-semibold text-primary-foreground transition-colors hover:bg-saffron/90"
                >
                  Execute
                </button>
                <button className="flex-1 rounded-lg border border-border bg-surface py-2 text-xs font-semibold transition-colors hover:bg-muted">
                  Dismiss
                </button>
              </div>
            </div>
          </div>

          {/* Queue Actions */}
          <div className="temple-panel p-4 sm:p-5">
            <h3 className="mb-4 text-sm font-bold">Queue Actions</h3>
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
          <div className="temple-panel flex flex-col justify-between p-4 sm:p-5">
            <div>
              <h3 className="mb-4 text-sm font-bold">Queue Config</h3>
              <div className="space-y-6 text-[11px]">
                <div>
                  <div className="mb-1 flex justify-between">
                    <span className="font-semibold text-muted-foreground">Max intake rate</span>
                    <span className="font-numeric font-bold tabular-nums">
                      {Math.round(inside / 100)} ppl/m
                    </span>
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
                    <span className="font-numeric font-bold tabular-nums">45 mins</span>
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
}
