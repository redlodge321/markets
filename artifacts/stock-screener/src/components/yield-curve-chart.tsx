import { useGetYieldCurve } from "@workspace/api-client-react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  AreaChart,
} from "recharts";

function CurveTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}) {
  if (!active || !payload?.length || payload[0]?.value == null) return null;
  return (
    <div className="glass-panel border border-zinc-500/40 rounded-lg px-3 py-2 text-xs font-mono shadow-xl">
      <p className="text-muted-foreground mb-0.5 uppercase tracking-wider text-[10px]">{label}</p>
      <p className="text-blue-400 font-semibold text-sm">{payload[0].value.toFixed(3)}%</p>
    </div>
  );
}

export function YieldCurveChart() {
  const { data, isLoading, isError, refetch } = useGetYieldCurve({
    query: { refetchInterval: 5 * 60_000 },
  });

  const points = data?.points ?? [];
  const chartData = points.map((p) => ({
    maturity: p.maturity,
    "US Yield": p.usYield != null ? p.usYield * 10 : undefined,
  }));

  const hasUs = points.some((p) => p.usYield != null);

  return (
    <section className="mb-2 border border-zinc-500/70 rounded-xl p-2">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-base">🇺🇸</span>
          <h3 className="text-lg font-bold text-foreground">US Treasury Yield Curve</h3>
        </div>
        <div className="flex items-center gap-3">
          {data?.asOf && (
            <span className="text-xs font-mono text-muted-foreground">as of {data.asOf}</span>
          )}
          <button
            onClick={() => refetch()}
            className="text-xs font-mono text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded border border-border/30 hover:border-border/60"
          >
            ↻ Refresh
          </button>
        </div>
      </div>

      {isError && (
        <div className="text-xs font-mono text-destructive px-2 py-1 mb-3 bg-destructive/10 rounded border border-destructive/20">
          Failed to load yield curve data.
        </div>
      )}

      <div className="h-64">
        {isLoading ? (
          <div className="flex items-center justify-center h-full text-xs font-mono text-muted-foreground uppercase tracking-widest animate-pulse">
            Fetching yield data…
          </div>
        ) : !hasUs ? (
          <div className="flex items-center justify-center h-full text-xs font-mono text-muted-foreground">
            Data unavailable
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 6, right: 12, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="usGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis
                dataKey="maturity"
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11, fontFamily: "monospace" }}
                tickLine={false}
                axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
              />
              <YAxis
                domain={[1, "auto"]}
                ticks={[1.0, 1.25, 1.5, 1.75, 2.0, 2.25, 2.5, 2.75, 3.0, 3.25, 3.5, 3.75, 4.0, 4.25, 4.5, 4.75, 5.0, 5.25, 5.5, 5.75, 6.0, 6.25, 6.5, 6.75, 7.0]}
                tickFormatter={(v) => `${v.toFixed(2)}%`}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11, fontFamily: "monospace" }}
                tickLine={false}
                axisLine={false}
                width={46}
              />
              <Tooltip content={<CurveTooltip />} />
              <ReferenceLine y={0} stroke="rgba(255,255,255,0.1)" strokeDasharray="4 4" />
              <Area
                type="monotone"
                dataKey="US Yield"
                stroke="#3b82f6"
                strokeWidth={2.5}
                fill="url(#usGrad)"
                dot={{ fill: "#3b82f6", r: 4, strokeWidth: 0 }}
                activeDot={{ r: 6, fill: "#3b82f6" }}
                connectNulls
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </section>
  );
}
