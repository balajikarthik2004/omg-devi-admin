import { useId, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Activity,
  ArrowUpRight,
  Car,
  Clock,
  Gauge,
  Plus,
  Pause,
  Megaphone,
  Merge,
  Siren,
  Users,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useJitter } from "@/lib/use-live";
import type { Temple } from "@/lib/temple-data";
import { StatCard } from "../ui/StatCard";

const footfallAllData = [
  { t: "5 AM", actual: 300, total: 300 },
  { t: "6 AM", actual: 800, total: 800 },
  { t: "7 AM", actual: 2400, total: 2400 },
  { t: "8 AM", actual: 6800, total: 6800 },
  { t: "9 AM", actual: 11200, total: 11200 },
  { t: "10 AM", actual: 14800, total: 14800 },
  { t: "11 AM", actual: 13900, total: 13900 },
  { t: "12 PM", actual: 11200, total: 11200 },
  { t: "1 PM", actual: 9400, total: 9400 },
  { t: "2 PM", actual: 12450, total: 12450 },
  { t: "3 PM", actual: null, total: 11800 },
  { t: "4 PM", actual: null, total: 12600 },
  { t: "5 PM", actual: null, total: 14900 },
  { t: "6 PM", actual: null, total: 16400 },
  { t: "7 PM", actual: null, total: 13200 },
  { t: "8 PM", actual: null, total: 9400 },
  { t: "9 PM", actual: null, total: 4200 },
];

const queueTrendData = [
  { t: "9:00 AM", common: 32, special20: 26, quick100: 16, vip: 5 },
  { t: "9:30 AM", common: 38, special20: 30, quick100: 18, vip: 5 },
  { t: "10:00 AM", common: 46, special20: 35, quick100: 22, vip: 6 },
  { t: "10:30 AM", common: 49, special20: 39, quick100: 25, vip: 7 },
  { t: "11:00 AM", common: 45, special20: 36, quick100: 24, vip: 6 },
  { t: "11:30 AM", common: 41, special20: 32, quick100: 22, vip: 6 },
  { t: "12:00 PM", common: 39, special20: 31, quick100: 20, vip: 5 },
  { t: "12:30 PM", common: 36, special20: 29, quick100: 19, vip: 5 },
  { t: "1:00 PM", common: 42, special20: 34, quick100: 22, vip: 7 },
  { t: "1:30 PM", common: 47, special20: 40, quick100: 25, vip: 7 },
  { t: "2:00 PM", common: 50, special20: 43, quick100: 27, vip: 8 },
  { t: "2:30 PM", common: 52, special20: 46, quick100: 28, vip: 8 },
];

const suggestions = [
  {
    kind: "URGENT",
    title: "Open Gate 3 — North Entrance",
    body: "580 people in North queue. Will overflow in 8 mins.",
    action: "Open Gate 3",
  },
  {
    kind: "WARNING",
    title: "Add 6 More Volunteers",
    body: "Not enough staff at Common & ₹20 Darshan.",
    action: "Notify Staff",
  },
  {
    kind: "INFO",
    title: "Evening Rush Preparation",
    body: "Expect 3,200 more devotees at 5:30 PM. Position staff by 5 PM.",
    action: "Set Reminder",
  },
  {
    kind: "SUCCESS",
    title: "Parking Overflow Not Needed",
    body: "Current inflow rate slowing. Lot A will stabilize at ~80% capacity.",
    action: "Dismiss",
  },
];

const lanes = [
  { id: "common", name: "Common Darshan", waiting: 620, capacity: 800, volunteers: 8 },
  { id: "special20", name: "₹20 Darshan", waiting: 540, capacity: 800, volunteers: 6 },
  { id: "quick100", name: "₹100 Darshan", waiting: 280, capacity: 500, volunteers: 4 },
  { id: "vip", name: "VIP Darshan", waiting: 34, capacity: 100, volunteers: 2 },
] as const;

const periods = [
  { label: "All day", start: 0, end: footfallAllData.length },
  { label: "Morning", start: 0, end: 7 },
  { label: "Afternoon & evening", start: 7, end: footfallAllData.length },
] as const;

const queueActions = [
  { icon: Plus, label: "Open new lane" },
  { icon: Pause, label: "Pause intake" },
  { icon: Megaphone, label: "Announce wait" },
  { icon: Merge, label: "Merge Common & ₹20" },
  { icon: Siren, label: "Emergency clear" },
];

const number = new Intl.NumberFormat("en-IN");
const latestQueue = queueTrendData[queueTrendData.length - 1];
const axis = { fontSize: 12, fill: "var(--muted-foreground)" };
const tooltipStyle = {
  background: "var(--card)",
  borderColor: "var(--border)",
  borderRadius: "10px",
};

export function DashboardSection({ temple }: { temple: Temple }) {
  const inside = useJitter(12450, 80);
  const parking = useJitter(78, 2);
  const capacity = 20000;
  const occupancy = Math.round((inside / capacity) * 100);
  const [periodIndex, setPeriodIndex] = useState(0);
  const [laneId, setLaneId] = useState<(typeof lanes)[number]["id"] | null>(null);
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [intake, setIntake] = useState(200);
  const [target, setTarget] = useState(45);
  const forecastPattern = useId();
  const period = periods[periodIndex];
  const arrivals = footfallAllData.slice(period.start, period.end);
  const peak = arrivals.reduce((highest, hour) => (hour.total > highest.total ? hour : highest));
  const selectedLane = lanes.find((lane) => lane.id === laneId);
  const overTarget = lanes.filter((lane) => latestQueue[lane.id] > target).length;
  const visibleSuggestions = suggestions.filter(
    (suggestion) => !dismissed.includes(suggestion.title),
  );
  const demoAction = (label: string) => toast.info(`Demo action: ${label}`);

  return (
    <div className="space-y-5">
      <header className="temple-dashboard-hero flex flex-col gap-5 rounded-2xl px-5 py-6 text-white sm:px-7 sm:py-7 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs font-semibold text-emerald-100">
            <span className="rounded-full border border-white/25 px-2.5 py-1">Sample data</span>
            <span>
              {temple.district}, {temple.state}
            </span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-4xl">
            Operations dashboard
          </h1>
          <p className="mt-2 text-sm text-emerald-100 sm:text-base">{temple.name}</p>
        </div>
        <dl className="grid grid-cols-1 gap-3 rounded-xl border border-white/15 bg-black/20 p-4 min-[420px]:grid-cols-2 sm:gap-6">
          <div>
            <dt className="text-xs font-medium text-emerald-100">Visitors today</dt>
            <dd className="mt-1 text-xl font-bold tabular-nums">76,480</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-emerald-100">Darshan flow</dt>
            <dd className="mt-1 text-xl font-bold tabular-nums">
              2,500 <span className="text-xs font-medium">/ hr</span>
            </dd>
          </div>
        </dl>
      </header>

      <div className="grid grid-cols-1 gap-3 min-[440px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <StatCard
          icon={Users}
          label="Inside the temple"
          value={number.format(inside)}
          sub={`${occupancy}% of ${number.format(capacity)} capacity`}
          progress={occupancy}
        />
        <StatCard
          icon={Clock}
          label="Longest queue wait"
          value={latestQueue.common}
          valueSuffix="min"
          sub="Common Darshan"
          bgTint="bg-saffron/10 text-[#895407]"
        />
        <StatCard
          icon={Car}
          label="Parking occupied"
          value={`${parking}%`}
          sub={`${(100 - parking) * 15} spaces available`}
          progress={parking}
          barGradient="var(--temple-gold)"
          bgTint="bg-saffron/10 text-[#895407]"
        />
        <StatCard
          icon={Activity}
          label="Volunteers on duty"
          value="48 / 60"
          sub="12 on break"
          progress={80}
        />
        <StatCard
          icon={Gauge}
          label="Congestion"
          value="Busy"
          sub="72% crowd density"
          bgTint="bg-saffron/10 text-[#895407]"
        />
      </div>

      <div className="grid items-stretch gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <section
          className="temple-panel flex flex-col gap-4 p-4 sm:p-5"
          aria-labelledby="arrivals-title"
        >
          <div>
            <h2 id="arrivals-title" className="text-lg font-extrabold tracking-tight">
              Hourly arrivals
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">Visitors entering per hour</p>
          </div>
          <div
            className="flex flex-wrap gap-1 rounded-lg bg-muted/70 p-1 self-start"
            role="group"
            aria-label="Arrival period"
          >
            {periods.map((range, index) => (
              <button
                key={range.label}
                type="button"
                aria-pressed={periodIndex === index}
                onClick={() => setPeriodIndex(index)}
                className={`rounded-md px-2.5 py-1.5 text-xs font-semibold ${periodIndex === index ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-card hover:text-foreground"}`}
              >
                {range.label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="size-3 rounded-sm bg-secondary" />
              Recorded
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-3 rounded-sm border border-dashed border-[#895407] bg-[#f8e6c5]" />
              Forecast
            </span>
          </div>
          <div className="h-52 min-w-0 sm:h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={arrivals}
                accessibilityLayer
                margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
              >
                <defs>
                  <pattern
                    id={forecastPattern}
                    width="6"
                    height="6"
                    patternUnits="userSpaceOnUse"
                    patternTransform="rotate(45)"
                  >
                    <rect width="6" height="6" fill="#f8e6c5" />
                    <path d="M0 0v6" stroke="#a77123" strokeWidth="2" />
                  </pattern>
                </defs>
                <CartesianGrid vertical={false} stroke="var(--border)" />
                <XAxis dataKey="t" tick={axis} axisLine={false} tickLine={false} minTickGap={18} />
                <YAxis
                  width={36}
                  domain={[0, 20000]}
                  ticks={[0, 5000, 10000, 15000, 20000]}
                  tick={axis}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value: number) => (value ? `${value / 1000}k` : "0")}
                />
                <Tooltip
                  cursor={{ fill: "var(--muted)", opacity: 0.65 }}
                  contentStyle={tooltipStyle}
                  formatter={(value: number, _name, item) => [
                    number.format(value),
                    item.payload.actual === null ? "Forecast visitors" : "Recorded visitors",
                  ]}
                />
                <Bar
                  dataKey="total"
                  maxBarSize={36}
                  radius={[3, 3, 0, 0]}
                  isAnimationActive={false}
                >
                  {arrivals.map((hour) => (
                    <Cell
                      key={hour.t}
                      fill={hour.actual === null ? `url(#${forecastPattern})` : "var(--secondary)"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-auto flex items-start gap-2.5 rounded-lg bg-muted px-3 py-2.5 text-sm">
            <ArrowUpRight size={17} className="mt-0.5 shrink-0 text-secondary" aria-hidden="true" />
            <p>
              <strong>{peak.actual === null ? "Forecast peak" : "Recorded peak"}</strong> at{" "}
              {peak.t} · {number.format(peak.total)} visitors
            </p>
          </div>
        </section>

        <section className="temple-panel flex flex-col p-4 sm:p-5" aria-labelledby="queues-title">
          <div>
            <h2 id="queues-title" className="text-lg font-extrabold tracking-tight">
              Darshan queue waits
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Latest sample at 2:30 PM · target {target} min
            </p>
          </div>
          <ul className="mt-4 space-y-3">
            {lanes.map((lane) => {
              const minutes = latestQueue[lane.id];
              const isOverTarget = minutes > target;
              return (
                <li key={lane.id}>
                  <button
                    type="button"
                    aria-expanded={laneId === lane.id}
                    aria-controls="dashboard-queue-trend"
                    onClick={() => setLaneId(laneId === lane.id ? null : lane.id)}
                    className={`block w-full rounded-lg border px-3 py-2.5 text-left transition-colors ${laneId === lane.id ? "border-secondary bg-muted" : "border-transparent hover:bg-muted/70"}`}
                  >
                    <span className="flex flex-wrap items-baseline justify-between gap-x-2 text-sm">
                      <span className="font-semibold">{lane.name}</span>
                      <span
                        className={`font-bold tabular-nums ${isOverTarget ? "text-[#895407]" : ""}`}
                      >
                        {minutes} min
                      </span>
                    </span>
                    <span
                      aria-hidden="true"
                      className="mt-2 block h-2 overflow-hidden rounded-full bg-muted"
                    >
                      <span
                        className={`block h-full rounded-full ${isOverTarget ? "bg-temple-gold" : "bg-secondary"}`}
                        style={{
                          width: `${(minutes / 60) * 100}%`,
                          backgroundColor: isOverTarget ? "var(--temple-gold)" : undefined,
                        }}
                      />
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          <div
            id="dashboard-queue-trend"
            className={selectedLane ? "mt-3 rounded-lg border border-border p-3" : "hidden"}
          >
            {selectedLane && (
              <>
                <h3 className="mb-2 text-sm font-bold">{selectedLane.name} wait trend</h3>
                <div className="h-36 min-w-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={queueTrendData}
                      accessibilityLayer
                      margin={{ top: 6, right: 10, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid vertical={false} stroke="var(--border)" />
                      <XAxis
                        dataKey="t"
                        tick={axis}
                        axisLine={false}
                        tickLine={false}
                        minTickGap={17}
                      />
                      <YAxis
                        width={30}
                        domain={[0, Math.max(60, target)]}
                        tick={axis}
                        axisLine={false}
                        tickLine={false}
                      />
                      <ReferenceLine y={target} stroke="#895407" strokeDasharray="4 3" />
                      <Tooltip
                        contentStyle={tooltipStyle}
                        formatter={(value: number) => [`${value} min`, "Wait"]}
                      />
                      <Line
                        dataKey={selectedLane.id}
                        stroke="var(--secondary)"
                        strokeWidth={2.5}
                        dot={false}
                        isAnimationActive={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </>
            )}
          </div>
          <div className="mt-auto pt-4 text-sm text-muted-foreground">
            <strong className="text-foreground">
              {overTarget === 0
                ? "All queues within target"
                : `${overTarget} of ${lanes.length} queues over target`}
            </strong>
            <span> · Select a queue to see its trend.</span>
          </div>
        </section>
      </div>

      <section className="temple-panel p-4 sm:p-5" aria-labelledby="recommendations-title">
        <h2 id="recommendations-title" className="text-lg font-extrabold tracking-tight">
          Recommended actions
        </h2>
        {visibleSuggestions.length ? (
          <ul className="mt-3 divide-y divide-border">
            {visibleSuggestions.map((suggestion) => (
              <li
                key={suggestion.title}
                className="flex flex-col gap-2 py-3 last:pb-0 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-bold">{suggestion.title}</h3>
                    {suggestion.kind === "URGENT" && (
                      <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-800">
                        Urgent
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{suggestion.body}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {suggestion.action !== "Dismiss" && (
                    <button
                      type="button"
                      onClick={() => demoAction(suggestion.action)}
                      className="rounded-lg border border-border bg-card px-3 py-2 text-xs font-bold hover:bg-muted"
                    >
                      {suggestion.action}
                    </button>
                  )}
                  <button
                    type="button"
                    aria-label={`Dismiss ${suggestion.title}`}
                    onClick={() => setDismissed((current) => [...current, suggestion.title])}
                    className="grid size-9 place-items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    <X size={16} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-muted-foreground">No remaining recommendations.</p>
        )}
      </section>

      <section className="temple-panel p-4 sm:p-5" aria-labelledby="queue-details-title">
        <h2 id="queue-details-title" className="text-lg font-extrabold tracking-tight">
          Queue capacity & staffing
        </h2>
        <ul className="mt-4 grid gap-3 min-[440px]:grid-cols-2 lg:grid-cols-4">
          {lanes.map((lane) => (
            <li key={lane.id} className="min-w-0 rounded-lg border border-border p-3">
              <h3 className="text-sm font-bold">{lane.name}</h3>
              <p className="mt-2 text-sm">
                <strong className="tabular-nums">
                  {lane.waiting} / {lane.capacity}
                </strong>{" "}
                waiting
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {lane.volunteers} volunteers · Active
              </p>
            </li>
          ))}
        </ul>
        <details className="mt-4 border-t border-border pt-3">
          <summary className="cursor-pointer rounded text-sm font-bold">Queue controls</summary>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="flex flex-wrap content-start gap-2">
              {queueActions.map(({ icon: Icon, label }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => demoAction(label)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-semibold hover:bg-muted"
                >
                  <Icon size={14} aria-hidden="true" />
                  {label}
                </button>
              ))}
            </div>
            <div className="space-y-3 text-sm">
              <label className="block">
                <span className="flex flex-wrap justify-between gap-x-2">
                  Max intake rate <strong>{intake} people/min</strong>
                </span>
                <input
                  type="range"
                  min={50}
                  max={400}
                  value={intake}
                  onChange={(event) => setIntake(event.target.valueAsNumber)}
                  className="w-full accent-primary"
                />
              </label>
              <label className="block">
                <span className="flex flex-wrap justify-between gap-x-2">
                  Target wait time <strong>{target} min</strong>
                </span>
                <input
                  type="range"
                  min={10}
                  max={120}
                  value={target}
                  onChange={(event) => setTarget(event.target.valueAsNumber)}
                  className="w-full accent-primary"
                />
              </label>
              <p className="text-muted-foreground">Auto-balance is on</p>
            </div>
          </div>
        </details>
      </section>
    </div>
  );
}
