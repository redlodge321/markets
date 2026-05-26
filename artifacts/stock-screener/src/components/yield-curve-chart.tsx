import { useGetYieldCurve } from "@workspace/api-client-react";
import { ShareButton } from "@/components/share-button";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Line,
  LineChart,
  Legend,
} from "recharts";

function CurveTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-panel border border-zinc-500/40 rounded-lg px-3 py-2 text-xs font-mono shadow-xl">
      <p className="text-muted-foreground mb-1 uppercase tracking-wider text-[10px]">{label}</p>
      {payload.map((entry) =>
        entry.value != null ? (
          <p key={entry.name} style={{ color: entry.color }} className="font-semibold text-sm">
            {entry.name}: {entry.value.toFixed(3)}%
          </p>
        ) : null
      )}
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
    "UST Current": p.usYield != null ? +(p.usYield * 10).toFixed(3) : undefined,
    "UST 1M Ago":  p.usYieldPrior != null ? +(p.usYieldPrior * 10).toFixed(3) : undefined,
    "High Yield":  p.hyYield != null ? +(p.hyYield * 10).toFixed(3) : undefined,
  }));

  const hasUs = points.some((p) => p.usYield != null);
  const priorAsOf = (data as { priorAsOf?: string } | undefined)?.priorAsOf;

  return (
    <section className="mb-2 border border-zinc-500/70 rounded-xl p-2">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-base">🇺🇸</span>
          <h3 className="text-lg font-bold text-foreground">US Treasury &amp; High Yield Curve</h3>
        </div>
        <div className="flex items-center gap-2">
          {data?.asOf && (
            <span className="text-xs font-mono text-muted-foreground">as of {data.asOf}</span>
          )}
          <ShareButton />
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

      <div className="h-72">
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
            <LineChart data={chartData} margin={{ top: 6, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis
                dataKey="maturity"
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11, fontFamily: "monospace" }}
                tickLine={false}
                axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
              />
              <YAxis
                domain={[2, 10]}
                ticks={[2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10]}
                tickFormatter={(v) => `${v.toFixed(1)}%`}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11, fontFamily: "monospace" }}
                tickLine={false}
                axisLine={false}
                width={46}
              />
              <Tooltip content={<CurveTooltip />} />
              <ReferenceLine y={0} stroke="rgba(255,255,255,0.1)" strokeDasharray="4 4" />
              <Legend
                formatter={(value) => {
                  if (value === "UST 1M Ago" && priorAsOf) return `UST 1M Ago (${priorAsOf})`;
                  return value;
                }}
                wrapperStyle={{ fontSize: 11, fontFamily: "monospace", paddingTop: 4 }}
              />
              <Line
                type="monotone"
                dataKey="UST Current"
                stroke="#3b82f6"
                strokeWidth={2.5}
                dot={{ fill: "#3b82f6", r: 4, strokeWidth: 0 }}
                activeDot={{ r: 6, fill: "#3b82f6" }}
                connectNulls
              />
              <Line
                type="monotone"
                dataKey="UST 1M Ago"
                stroke="#ef4444"
                strokeWidth={2}
                dot={{ fill: "#ef4444", r: 3, strokeWidth: 0 }}
                activeDot={{ r: 5, fill: "#ef4444" }}
                connectNulls
              />
              <Line
                type="monotone"
                dataKey="High Yield"
                stroke="#16a34a"
                strokeWidth={2.5}
                dot={{ fill: "#16a34a", r: 4, strokeWidth: 0 }}
                activeDot={{ r: 6, fill: "#16a34a" }}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </section>
  );
}
