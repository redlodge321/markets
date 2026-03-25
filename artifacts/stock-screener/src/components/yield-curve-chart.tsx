import { useGetYieldCurve } from "@workspace/api-client-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  AreaChart,
} from "recharts";

function CurveTooltip({ active, payload, label, color }: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
  color: string;
}) {
  if (!active || !payload?.length || payload[0]?.value == null) return null;
  return (
    <div className="glass-panel border border-zinc-500/40 rounded-lg px-3 py-2 text-xs font-mono shadow-xl">
      <p className="text-muted-foreground mb-0.5 uppercase tracking-wider text-[10px]">{label}</p>
      <p style={{ color }} className="font-semibold text-sm">{payload[0].value.toFixed(3)}%</p>
    </div>
  );
}

function SingleCurve({
  title,
  flag,
  dataKey,
  color,
  gradientId,
  data,
  isLoading,
  noData,
}: {
  title: string;
  flag: string;
  dataKey: string;
  color: string;
  gradientId: string;
  data: Record<string, string | number | undefined>[];
  isLoading: boolean;
  noData: boolean;
}) {
  const yields = data.map((d) => d[dataKey]).filter((v) => v != null) as number[];
  const minY = yields.length ? Math.max(0, Math.min(...yields) - 0.3) : 0;
  const maxY = yields.length ? Math.max(...yields) + 0.3 : 6;

  return (
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-base">{flag}</span>
        <h4 className="text-sm font-bold text-foreground">{title}</h4>
      </div>
      <div className="h-52">
        {isLoading ? (
          <div className="flex items-center justify-center h-full text-xs font-mono text-muted-foreground uppercase tracking-widest animate-pulse">
            Loading…
          </div>
        ) : noData ? (
          <div className="flex items-center justify-center h-full text-xs font-mono text-muted-foreground text-center px-4">
            Data unavailable
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 6, right: 12, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis
                dataKey="maturity"
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10, fontFamily: "monospace" }}
                tickLine={false}
                axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
              />
              <YAxis
                domain={[minY, maxY]}
                tickFormatter={(v) => `${v.toFixed(1)}%`}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10, fontFamily: "monospace" }}
                tickLine={false}
                axisLine={false}
                width={42}
              />
              <Tooltip content={(props) => (
                <CurveTooltip {...props} color={color} />
              )} />
              <ReferenceLine y={0} stroke="rgba(255,255,255,0.1)" strokeDasharray="4 4" />
              <Area
                type="monotone"
                dataKey={dataKey}
                stroke={color}
                strokeWidth={2.5}
                fill={`url(#${gradientId})`}
                dot={{ fill: color, r: 4, strokeWidth: 0 }}
                activeDot={{ r: 6, fill: color }}
                connectNulls
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
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
    "US Yield": p.usYield ?? undefined,
    "EU Yield": p.euYield ?? undefined,
  }));

  const hasUs = points.some((p) => p.usYield != null);
  const hasEu = points.some((p) => p.euYield != null);

  return (
    <section className="mb-4 border border-zinc-500/70 rounded-xl p-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-bold text-foreground">Yield Curves</h3>
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

      <div className="flex gap-6">
        <SingleCurve
          title="US Treasury"
          flag="🇺🇸"
          dataKey="US Yield"
          color="#3b82f6"
          gradientId="usGrad"
          data={chartData}
          isLoading={isLoading}
          noData={!isLoading && !hasUs}
        />
        <div className="w-px bg-zinc-700/50 self-stretch" />
        <SingleCurve
          title="Euro Area AAA"
          flag="🇪🇺"
          dataKey="EU Yield"
          color="#f59e0b"
          gradientId="euGrad"
          data={chartData}
          isLoading={isLoading}
          noData={!isLoading && !hasEu}
        />
      </div>
    </section>
  );
}
