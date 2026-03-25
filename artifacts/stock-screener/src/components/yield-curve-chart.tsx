import { useGetYieldCurve } from "@workspace/api-client-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

const MATURITIES = ["3M", "2Y", "5Y", "10Y", "30Y"];

function CustomTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-panel border border-zinc-500/40 rounded-lg px-3 py-2 text-xs font-mono shadow-xl">
      <p className="text-muted-foreground mb-1 uppercase tracking-wider">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full inline-block" style={{ background: p.color }} />
          <span className="text-foreground">{p.name}:</span>
          <span style={{ color: p.color }} className="font-semibold">
            {p.value != null ? `${p.value.toFixed(3)}%` : "—"}
          </span>
        </div>
      ))}
    </div>
  );
}

export function YieldCurveChart() {
  const { data, isLoading, isError, refetch } = useGetYieldCurve({
    query: { refetchInterval: 5 * 60_000 },
  });

  const chartData = (data?.points ?? MATURITIES.map((m) => ({
    maturity: m, maturityYears: 0, usYield: null, euYield: null,
  }))).map((p) => ({
    maturity: p.maturity,
    "US Treasury": p.usYield ?? undefined,
    "Euro Area AAA": p.euYield ?? undefined,
  }));

  const hasEu = data?.points?.some((p) => p.euYield != null);

  return (
    <section className="mb-4 border border-zinc-500/70 rounded-xl p-4">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-bold text-foreground">Yield Curve Comparison</h3>
          <span className="px-2 py-0.5 rounded text-[10px] uppercase font-mono bg-primary/10 text-primary border border-primary/20 tracking-widest">
            US vs EU
          </span>
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
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 8, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis
                dataKey="maturity"
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11, fontFamily: "monospace" }}
                tickLine={false}
                axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
              />
              <YAxis
                tickFormatter={(v) => `${v.toFixed(2)}%`}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11, fontFamily: "monospace" }}
                tickLine={false}
                axisLine={false}
                width={52}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: "11px", fontFamily: "monospace", paddingTop: "8px" }}
                formatter={(value) => (
                  <span style={{ color: "hsl(var(--muted-foreground))" }}>{value}</span>
                )}
              />
              <ReferenceLine y={0} stroke="rgba(255,255,255,0.15)" strokeDasharray="4 4" />
              <Line
                type="monotone"
                dataKey="US Treasury"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: "#3b82f6", r: 4, strokeWidth: 0 }}
                activeDot={{ r: 6 }}
                connectNulls
              />
              {hasEu && (
                <Line
                  type="monotone"
                  dataKey="Euro Area AAA"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  dot={{ fill: "#f59e0b", r: 4, strokeWidth: 0 }}
                  activeDot={{ r: 6 }}
                  connectNulls
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {!isLoading && !hasEu && data && (
        <p className="text-[10px] font-mono text-muted-foreground mt-2 text-center">
          Euro Area data unavailable (ECB API) — showing US curve only
        </p>
      )}
    </section>
  );
}
