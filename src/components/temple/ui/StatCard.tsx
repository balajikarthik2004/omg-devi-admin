import { TrendingUp, TrendingDown, type LucideIcon } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  color?: string;
  sub?: string;
  trend?: { up: boolean; text: string };
  status?: { warning?: boolean; text: string };
  valueSuffix?: React.ReactNode;
  bgTint?: string;
  progress?: number;
  barGradient?: string;
}

export function StatCard({
  icon: Icon,
  label,
  value,
  color = "",
  sub,
  trend,
  status,
  valueSuffix,
  bgTint,
  progress,
  barGradient,
}: StatCardProps) {
  const alert = /red|danger|#e22e26/i.test(color);
  const gold = /amber|gold|orange|saffron|#f5820a/i.test(color);
  const accent =
    barGradient ??
    (alert ? "var(--temple-red)" : gold ? "var(--temple-gold)" : "var(--temple-success)");
  const percentage = progress === undefined ? undefined : Math.min(100, Math.max(0, progress));

  return (
    <div className="temple-panel flex min-w-0 flex-col gap-2.5 p-3.5 sm:p-4">
      <div className="flex min-w-0 items-center gap-2">
        <span
          aria-hidden="true"
          className={
            "grid size-8 shrink-0 place-items-center rounded-xl " +
            (bgTint ?? "bg-secondary-tint text-secondary")
          }
        >
          <Icon size={17} />
        </span>
        <span className="min-w-0 text-xs font-bold leading-tight">{label}</span>
      </div>
      <div className="min-w-0">
        <div className="flex flex-wrap items-baseline gap-1 text-xl font-extrabold tracking-tight tabular-nums sm:text-2xl">
          {value}
          {valueSuffix && (
            <span className="text-xs font-bold text-muted-foreground">{valueSuffix}</span>
          )}
        </div>
        {(trend || status || sub) && (
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            {trend && (
              <span
                className={
                  "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold " +
                  (trend.up ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-destructive")
                }
              >
                {trend.up ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                {trend.text}
              </span>
            )}
            {status && (
              <span
                className={
                  "rounded-full px-1.5 py-0.5 text-[10px] font-bold " +
                  (status.warning ? "bg-gold/10 text-saffron" : "bg-emerald/10 text-emerald")
                }
              >
                {status.text}
              </span>
            )}
            {sub && <span className="text-[11px] font-medium text-muted-foreground">{sub}</span>}
          </div>
        )}
      </div>
      {percentage !== undefined && (
        <div
          role="meter"
          aria-label={label}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percentage}
          className="mt-auto h-1 w-full overflow-hidden rounded-full bg-muted"
        >
          <div
            className="h-full rounded-full transition-[width] duration-200"
            style={{ width: percentage + "%", background: accent }}
          />
        </div>
      )}
    </div>
  );
}
