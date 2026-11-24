import { TrendingUp, TrendingDown } from "lucide-react";

interface StatCardProps {
  icon: any;
  label: string;
  value: string | number;
  color?: string;
  sub?: string;
  trend?: { up: boolean; text: string };
  valueSuffix?: React.ReactNode;
  bgTint?: string;
  progress?: number;
  barGradient?: string;
}

export function StatCard({
  icon: Icon,
  label,
  value,
  color = "text-foreground",
  sub,
  trend,
  valueSuffix,
  bgTint,
  progress,
  barGradient,
}: StatCardProps) {
  // Safely map text colors to background and gradient colors for Tailwind JIT
  let glowClass = "from-primary/20 to-primary/0";
  let lineClass = "bg-primary";
  let progressClass = "bg-primary";

  if (color.includes("emerald")) {
    glowClass = "from-emerald-500/20 to-emerald-500/0";
    lineClass = "bg-emerald-500";
    progressClass = "bg-emerald-500";
  } else if (color.includes("amber") || color.includes("saffron") || color.includes("orange")) {
    glowClass = "from-amber-500/20 to-amber-500/0";
    lineClass = "bg-amber-500";
    progressClass = "bg-amber-500";
  } else if (color.includes("indigo") || color.includes("navy")) {
    glowClass = "from-indigo-900/20 to-indigo-900/0";
    lineClass = "bg-[#131a72]";
    progressClass = "bg-[#131a72]";
  } else if (color.includes("red") || color.includes("primary")) {
    glowClass = "from-red-600/20 to-red-600/0";
    lineClass = "bg-[#e32c26]";
    progressClass = "bg-[#e32c26]";
  } else if (color.includes("gold")) {
    glowClass = "from-amber-600/20 to-amber-600/0";
    lineClass = "bg-[#d97706]";
    progressClass = "bg-[#d97706]";
  }

  return (
    <div className="relative group overflow-hidden rounded-2xl border border-border/50 bg-white/70 p-4 sm:p-4.5 shadow-sm backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md flex flex-col justify-between min-w-0">
      {/* Subtle Theme Glow Blob */}
      <div
        className={`absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br ${glowClass} opacity-30 blur-2xl pointer-events-none transition-all duration-500 group-hover:scale-125 group-hover:opacity-70`}
      />

      <div className="relative z-10 flex flex-col justify-between h-full gap-2.5 min-w-0">
        {/* Top Row: Heading (Left) + Icon (Right) */}
        <div className="flex items-center justify-between gap-2 min-w-0">
          <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest truncate leading-tight">
            {label}
          </span>

          <div
            className={`shrink-0 flex h-8 w-8 items-center justify-center rounded-xl shadow-2xs transition-transform duration-300 group-hover:scale-105 ${
              bgTint || "bg-white border border-border/50 text-muted-foreground"
            }`}
          >
            <Icon size={16} />
          </div>
        </div>

        {/* Middle: Value */}
        <div className="flex flex-col min-w-0">
          <h3
            className={`flex items-baseline gap-1 text-2xl font-black tracking-tight ${color} tabular-nums leading-none truncate`}
          >
            {value}
            {valueSuffix && (
              <span className="text-xs font-bold text-muted-foreground tracking-normal">
                {valueSuffix}
              </span>
            )}
          </h3>

          {/* Sub / Trend Row */}
          {(trend || sub) && (
            <div className="flex items-center gap-1.5 mt-2 min-w-0 overflow-hidden">
              {trend && (
                <div
                  className={`inline-flex shrink-0 items-center gap-0.5 rounded-full px-1.5 py-0.2 text-[9px] font-bold shadow-2xs ${
                    trend.up
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-red-50 text-[#e32c26] border border-red-200"
                  }`}
                >
                  {trend.up ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                  <span>{trend.text}</span>
                </div>
              )}

              {sub && (
                <span className="text-[11px] font-semibold text-muted-foreground truncate">
                  {sub}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Integrated Slim Progress Line (Theme Tailored) */}
        {progress !== undefined && (
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden shadow-inner mt-1">
            <div
              className={`h-full rounded-full transition-all duration-700 ${!barGradient ? progressClass : ""}`}
              style={{
                width: `${Math.min(100, Math.max(0, progress))}%`,
                background: barGradient || undefined,
              }}
            />
          </div>
        )}
      </div>

      {/* Bottom subtle accent line on hover */}
      <div
        className={`absolute bottom-0 left-0 h-0.5 w-0 transition-all duration-300 group-hover:w-full opacity-80 ${
          !barGradient ? lineClass : ""
        }`}
        style={barGradient ? { background: barGradient } : undefined}
      />
    </div>
  );
}
